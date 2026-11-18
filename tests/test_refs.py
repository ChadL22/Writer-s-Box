"""End-to-end tests of references: the BibTeX engine, the References tab, import/export and citing.

Covers parsing and rewriting BibTeX without disturbing other entries, RIS and CSL-JSON import,
DOI lookup (doi.org is mocked), APA/Chicago/MLA formatting, the citation check, adding, editing
and deleting references, exports, and the Cite button in the editor.

Run:  ./build.sh && python3 tests/test_refs.py
"""
import asyncio
import json
import os
import pathlib

from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
APP = (ROOT / "index.html").as_uri()
SHOTS = ROOT / "tests" / "screenshots"
SHOTS.mkdir(exist_ok=True)
CHROME = os.environ.get("CHROME_PATH")
failures = []

BIB = r"""% My library
@string{aer = "American Economic Review"}

@article{smith2020,
  author  = {Smith, Jane and van der Berg, Pieter and {World Bank}},
  title   = {Dark Patterns and {Consumer} Welfare},
  journal = aer,
  year    = 2020,
  volume  = {110},
  number  = {3},
  pages   = {101--130},
  doi     = {10.1257/aer.2020.0001}
}

@book{mill1859,
  author    = "Mill, John Stuart",
  title     = "On Liberty",
  publisher = {John W. Parker},
  year      = {1859}
}
"""

RIS = """TY  - JOUR
AU  - Doe, John
AU  - Roe, Richard
TI  - Click to Cancel: Evidence from Subscriptions
T2  - Journal of Consumer Policy
PY  - 2023
VL  - 46
SP  - 1
EP  - 22
DO  - 10.1007/s10603-023-0001
ER  -

TY  - BOOK
AU  - Thaler, Richard H.
TI  - Nudge
PB  - Yale University Press
PY  - 2008
ER  -
"""

CSL_DOI = {"type": "article-journal", "title": "Shining a Light on Dark Patterns", "author": [{"family": "Mathur", "given": "Arunesh"}, {"family": "Mayer", "given": "Jonathan"}],
           "container-title": "Journal of Legal Analysis", "issued": {"date-parts": [[2021]]}, "volume": "13", "issue": "1", "page": "43-109", "DOI": "10.1093/jla/laaa006", "publisher": "Oxford University Press"}


def check(name, cond, detail=""):
    print(("PASS " if cond else "FAIL ") + name + (f"  ({detail})" if detail and not cond else ""))
    if not cond:
        failures.append(name)


async def main():
    async with async_playwright() as p:
        kw = {"executable_path": CHROME, "args": ["--no-sandbox"]} if CHROME else {}
        browser = await p.chromium.launch(**kw)
        ctx = await browser.new_context(viewport={"width": 1360, "height": 900}, accept_downloads=True)
        page = await ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))

        async def doi_route(route):
            url = route.request.url
            hdr = {"Access-Control-Allow-Origin": "*", "Content-Type": "application/vnd.citationstyles.csl+json"}
            if "laaa006" in url:
                await route.fulfill(status=200, headers=hdr, body=json.dumps(CSL_DOI))
            else:
                await route.fulfill(status=404, headers=hdr, body="{}")
        await page.route("https://doi.org/**", doi_route)
        await page.goto(APP)
        await page.wait_for_timeout(1200)

        async def shot(name, full=False):
            await page.wait_for_timeout(250)
            await page.screenshot(path=str(SHOTS / f"refs-{name}.png"), full_page=full)

        # ---------- engine ----------
        r = await page.evaluate("""bib => {
          const es = parseBib(bib), out = {};
          out.keys = es.map(e => e.key); out.journal = es[0].fields.journal; out.year = es[0].fields.year;
          const v = refView(es[0]); out.authors = v.authors.map(a => a.literal || a.family); out.container = v.container;
          out.apa = formatRef(v, "apa"); out.chicago = formatRef(v, "chicago"); out.mla = formatRef(v, "mla");
          out.intext = inTextCite(v, "apa"); out.mlaBook = formatRef(refView(es[1]), "mla");
          const re = parseBib(entryToBib(es[0]))[0]; out.round = JSON.stringify(re.fields) === JSON.stringify(es[0].fields) && re.key === es[0].key;
          return out; }""", BIB)
        check("parses entries and skips @string", r["keys"] == ["smith2020", "mill1859"], r["keys"])
        check("expands @string macros and bare numbers", r["journal"] == "American Economic Review" and r["year"] == "2020", r)
        check("names: particles and organisations", r["authors"] == ["Smith", "van der Berg", "World Bank"], r["authors"])
        check("BibTeX round-trips through the writer", r["round"])
        check("APA format", r["apa"].startswith("Smith, J., van der Berg, P., & World Bank. (2020).") and "*American Economic Review*" in r["apa"] and "https://doi.org/10.1257/aer.2020.0001" in r["apa"], r["apa"])
        check("Chicago format", r["chicago"].startswith("Smith, Jane, Pieter van der Berg, and World Bank. 2020.") and "“Dark Patterns" in r["chicago"], r["chicago"])
        check("MLA format", r["mla"].startswith("Smith, Jane, et al.") and "“Dark Patterns and Consumer Welfare.”" in r["mla"], r["mla"])
        check("MLA book", "*On Liberty*" in r["mlaBook"] and "John W. Parker, 1859" in r["mlaBook"], r["mlaBook"])
        check("APA in-text citation", r["intext"] == "(Smith et al., 2020)", r["intext"])

        r = await page.evaluate("""ris => { const a = risToFields(ris); return { n: a.length, t: a.map(x => x.type), au: a[0].fields.author, pages: a[0].fields.pages, doi: a[0].fields.doi, j: a[0].fields.journal, pub: a[1].fields.publisher }; }""", RIS)
        check("RIS import", r["n"] == 2 and r["t"] == ["article", "book"] and r["au"] == "Doe, John and Roe, Richard" and r["pages"] == "1--22" and r["j"] == "Journal of Consumer Policy", r)
        r = await page.evaluate("""csl => { const a = cslToFields([csl])[0]; const back = refToCsl(refView({ type: a.type, key: "k", fields: a.fields })); const ris = refToRis(refView({ type: a.type, key: "k", fields: a.fields })); return { type: a.type, author: a.fields.author, year: a.fields.year, pages: a.fields.pages, backTitle: back.title, backAuthors: back.author.length, ris }; }""", CSL_DOI)
        check("CSL-JSON import and export", r["type"] == "article" and r["author"] == "Mathur, Arunesh and Mayer, Jonathan" and r["year"] == "2021" and r["backTitle"] == "Shining a Light on Dark Patterns" and r["backAuthors"] == 2, r)
        check("RIS export", r["ris"].startswith("TY  - JOUR") and "AU  - Mathur, Arunesh" in r["ris"] and r["ris"].rstrip().endswith("ER  -"), r["ris"][:120])

        r = await page.evaluate("""bib => { const p = { working: { "x.bib": { text: bib } } }; const es = parseBib(bib);
          replaceEntry(p, "x.bib", refView(es[1]), { type: "book", key: "mill1859", fields: { ...es[1].fields, edition: "2" } });
          const t = p.working["x.bib"].text; const before = bib.slice(0, es[1].start);
          return { keepsTop: t.startsWith(before), hasEdition: /edition\\s*=\\s*\\{2\\}/.test(t), n: parseBib(t).length }; }""", BIB)
        check("editing one entry leaves the rest of the file byte-for-byte", r["keepsTop"] and r["hasEdition"] and r["n"] == 2, r)

        # ---------- References tab ----------
        await page.evaluate("""bib => { const p = P(); p.working["refs.bib"].text = bib + "\\n" + p.working["refs.bib"].text; p.working["memo.tex"].text += "\\nAs shown by \\\\citet{smith2020} and \\\\cite[p.~4]{mill1859,doe2023missing}.\\n"; p.working["notes.md"].text += "\\nSee [@smith2020, p. 3]. Email me at chad@example.com.\\n"; persist(p, true); go("refs"); }""", BIB)
        await page.wait_for_timeout(400)
        tab = await page.inner_text('[data-tab="refs"]')
        check("References tab shows a count", "References" in tab and "3" in tab, tab)
        flash = await page.inner_text("#view .flash") if await page.query_selector("#view .flash") else ""
        check("citation check finds a missing key", "doe2023missing" in flash, flash)
        uses = await page.evaluate("Object.keys(citationsIn(P())).sort()")
        check("finds LaTeX and Markdown citations, not emails", uses == ["doe2023missing", "mill1859", "smith2020"], uses)
        rows = await page.query_selector_all("[data-rk]")
        check("lists every reference", len(rows) == 3, len(rows))
        await shot("list")

        await page.click('[data-rk="smith2020"] [data-toggle]')
        await page.wait_for_timeout(200)
        det = await page.inner_text('[data-rk="smith2020"]')
        check("details show formatted reference and where cited", "memo.tex" in det and "notes.md" in det and "Smith, J." in det, det[:300])
        await shot("detail")
        await page.select_option("#rf-style", "chicago")
        await page.wait_for_timeout(200)
        det = await page.inner_text('[data-rk="smith2020"] .rf-formatted')
        check("style switch reformats", det.startswith("Smith, Jane, Pieter"), det)

        await page.fill("#rf-q", "liberty")
        await page.wait_for_timeout(450)
        check("search filters", len(await page.query_selector_all("[data-rk]")) == 1)
        await page.fill("#rf-q", "")
        await page.wait_for_timeout(450)
        await page.select_option("#rf-cited", "no")
        await page.wait_for_timeout(200)
        names = await page.eval_on_selector_all("[data-rk]", "els => els.map(e => e.dataset.rk)")
        check("not-cited filter", names == ["example2025survey"], names)
        await page.select_option("#rf-cited", "")
        await page.select_option("#rf-style", "apa")

        # add the missing reference from the flash
        await page.click('[data-miss="doe2023missing"]')
        await page.wait_for_timeout(200)
        check("missing key prefilled", await page.input_value("#rf-key-e") == "doe2023missing")
        await page.fill("#rf-author", "Doe, John\nRoe, Richard")
        await page.fill("#rf-title", "Click to Cancel")
        await page.fill("#rf-year", "2023")
        await page.fill("#rf-journal", "Journal of Consumer Policy")
        await page.wait_for_timeout(150)
        prev = await page.inner_text("#rf-prev")
        check("live preview", prev.startswith("Doe, J., & Roe, R. (2023). Click to Cancel."), prev)
        await shot("add")
        await page.click(".mactions .btn-primary")
        await page.wait_for_timeout(300)
        bib = await page.evaluate("P().working['refs.bib'].text")
        check("adds the entry to the .bib", "@article{doe2023missing," in bib and "author  = {Doe, John and Roe, Richard}" in bib.replace("author = ", "author  = "), bib[-300:])
        check("flash clears once added", await page.query_selector("#view .flash:not(.info)") is None or "doe2023missing" not in await page.inner_text("#main"[:0] + "#view .flash"))

        # edit
        await page.click('[data-rk="mill1859"] [data-toggle]')
        await page.click('[data-rk="mill1859"] [data-edit]')
        await page.wait_for_timeout(200)
        await page.fill("#rf-edition", "2")
        await page.fill("#rf-key-e", "smith2020")
        await page.click(".mactions .btn-primary")
        await page.wait_for_timeout(150)
        msg = await page.inner_text("#rf-msg")
        check("rejects a duplicate key", "already used" in msg, msg)
        await page.fill("#rf-key-e", "mill1859")
        await page.click(".mactions .btn-primary")
        await page.wait_for_timeout(300)
        bib2 = await page.evaluate("P().working['refs.bib'].text")
        check("edit changes only that entry", "edition" in bib2 and bib2.startswith("% My library\n@string{aer") and "journal = aer" in bib2, bib2[:200])

        # import paste + RIS file + DOI
        await page.click("#rf-import")
        await page.click('[data-m="paste"]')
        await page.fill("#rf-paste", "@inproceedings{gray2018,\n author={Gray, Colin M. and Kou, Yubo},\n title={The Dark (Patterns) Side of {UX} Design},\n booktitle={Proceedings of CHI},\n year={2018}\n}\n@book{mill1859dup, author={Mill, John Stuart}, title={On Liberty}, year={1859}}")
        await page.click(".mactions .btn-primary")
        await page.wait_for_timeout(300)
        n = await page.evaluate("refCount(P())")
        check("paste import adds new and skips duplicates", n == 5, n)
        ris_path = SHOTS.parent / "sample.ris"
        ris_path.write_text(RIS)
        await page.click("#rf-import")
        await page.set_input_files("#rf-in", str(ris_path))
        await page.wait_for_timeout(500)
        n = await page.evaluate("refCount(P())")
        check("RIS file import", n == 7, n)
        await page.click("#rf-import")
        await page.click('[data-m="doi"]')
        await page.fill("#rf-dois", "https://doi.org/10.1093/jla/laaa006\n10.9999/nothing")
        await page.click(".mactions .btn-primary")
        await page.wait_for_timeout(600)
        n = await page.evaluate("refCount(P())")
        keys = await page.evaluate("[...allRefKeys(P())]")
        check("DOI import (missing DOI reported, found one added)", n == 8 and any(k.startswith("mathur2021") for k in keys), keys)
        await shot("after-import")

        # add via DOI in the form
        await page.click("#rf-add")
        await page.fill("#rf-doi", "10.1093/jla/laaa006")
        await page.click("#rf-doi-go")
        await page.wait_for_timeout(400)
        check("form fills from DOI", await page.input_value("#rf-title") == "Shining a Light on Dark Patterns" and "Mathur, Arunesh" in await page.input_value("#rf-author"))
        await page.click(".mactions button:not(.btn-primary)")

        # exports
        await page.click("#rf-export")
        await page.wait_for_timeout(200)
        await page.check('input[name="scope"][value="cited"]')
        await page.wait_for_timeout(150)
        prev = await page.inner_text("#ex-prev")
        check("cited-only bibliography preview", "Doe, J." in prev and "Gray" not in prev, prev)
        await shot("export")
        outs = {}
        for kind in ["bib", "ris", "json", "md", "docx"]:
            async with page.expect_download() as dl:
                await page.click(f'[data-ex="{kind}"]')
            d = await dl.value
            path = await d.path()
            outs[kind] = (d.suggested_filename, pathlib.Path(path).read_bytes())
        check("exports .bib of cited entries", outs["bib"][0].endswith(".bib") and outs["bib"][1].decode().count("@") == 3, outs["bib"][1][:200])
        check("exports RIS", outs["ris"][1].decode().count("ER  -") == 3)
        check("exports CSL-JSON", len(json.loads(outs["json"][1])) == 3)
        md = outs["md"][1].decode()
        check("exports Markdown bibliography in order", md.startswith("# References") and md.index("Doe") < md.index("Mill") < md.index("Smith"), md[:200])
        check("exports Word bibliography", outs["docx"][1][:2] == b"PK")
        await page.click(".mactions .btn")

        # delete
        await page.click('[data-rk="example2025survey"] [data-toggle]')
        await page.click('[data-rk="example2025survey"] [data-del]')
        await page.click(".mactions .btn-danger")
        await page.wait_for_timeout(300)
        check("delete removes the entry", "example2025survey" not in await page.evaluate("P().working['refs.bib'].text"))

        # Cite button
        await page.evaluate("go('file', { file: 'memo.tex', fileMode: 'write' })")
        await page.wait_for_timeout(300)
        await page.evaluate("() => { const t = document.querySelector('#ed'); t.focus(); t.setSelectionRange(0, 0); }")
        await page.click("#f-cite")
        await page.fill("#ct-q", "gray")
        await page.check('#ct-list input[value="gray2018"]')
        await page.fill("#ct-q", "mill")
        await page.check('#ct-list input[value="mill1859"]')
        await shot("cite")
        await page.click(".mactions .btn-primary")
        await page.wait_for_timeout(300)
        t = await page.evaluate("P().working['memo.tex'].text")
        check("Cite inserts \\cite at the cursor", t.startswith("\\cite{mill1859,gray2018}") or t.startswith("\\cite{gray2018,mill1859}"), t[:60])
        await page.evaluate("go('file', { file: 'notes.md', fileMode: 'write' })")
        await page.wait_for_timeout(300)
        await page.click("#f-cite")
        await page.check('#ct-list input[value="smith2020"]')
        await page.click(".mactions .btn-primary")
        await page.wait_for_timeout(200)
        t = await page.evaluate("P().working['notes.md'].text")
        check("Cite inserts [@key] in Markdown", "[@smith2020]" in t)

        # .ris through the Import page becomes .bib
        await page.evaluate("go('import')")
        await page.wait_for_timeout(200)
        await page.set_input_files("#in-files", str(ris_path))
        await page.wait_for_timeout(700)
        check("Import page converts .ris to .bib", await page.evaluate("!!P().working['sample.bib'] && parseBib(P().working['sample.bib'].text).length === 2"))
        check("bib files show in References", await page.evaluate("bibFiles(P()).includes('sample.bib')"))

        # save as version and check history picks it up
        await page.evaluate("go('refs')")
        await page.wait_for_timeout(200)
        await shot("final", True)
        check("no page errors", not errors, errors[:3])
        ris_path.unlink()
        await browser.close()
    print(f"\n{'All passed' if not failures else str(len(failures)) + ' failed'}")
    raise SystemExit(1 if failures else 0)

asyncio.run(main())
