import subprocess
import os
import re

def parse_toc(toc_file):
    """Parse a .toc file and return a list of (level, number, name, page) tuples."""
    entries = []
    chapter_count = 0
    if not os.path.exists(toc_file):
        return entries
    with open(toc_file, "r") as f:
        for line in f:
            line = line.strip()
            if not line.startswith(r"\contentsline"):
                continue

            # Match numbered entry: \contentsline {section}{\numberline {1}Title}{3}{...}
            m = re.match(
                r"\\contentsline\s*\{(\w+)\}\{\\numberline\s*\{([^}]+)\}([^{}]+)\}\{(\d+)\}",
                line
            )
            if m:
                level = m.group(1)
                latex_num = m.group(2).strip()   # e.g. "1", "1.1"
                name = m.group(3).strip()
                page = m.group(4).strip()
                if level == "section":
                    chapter_count += 1
                    entries.append((level, str(chapter_count), name, page))
                elif level == "subsection":
                    # The name already contains the number like "1.1 Objective"
                    entries.append((level, latex_num, name, page))
                continue

            # Match unnumbered entry: \contentsline {section}{ABSTRACT}{1}{...}
            m2 = re.match(
                r"\\contentsline\s*\{(\w+)\}\{([^\\][^}]*)\}\{(\d+)\}",
                line
            )
            if m2:
                level = m2.group(1)
                name = m2.group(2).strip()
                page = m2.group(3).strip()
                if level == "section":
                    # Auto-number chapters that don't have numbers in the .toc file
                    # Skip numbering for front/back matter
                    skip_numbering = ["ABSTRACT", "APPENDIX", "REFERENCE", "REFERENCES", "TABLE OF CONTENTS"]
                    if name.upper() not in skip_numbering:
                        chapter_count += 1
                        entries.append((level, str(chapter_count), name, page))
                    else:
                        entries.append((level, "", name, page))
                elif level == "subsection":
                    entries.append((level, "", name, page))
    return entries


def build_toc_table(entries):
    """Build a LaTeX longtable string from parsed TOC entries."""
    lines = []
    lines.append(r"\begin{center}")
    lines.append(r"{\large\bfseries TABLE OF CONTENTS}")
    lines.append(r"\end{center}")
    lines.append(r"\vspace{1em}")
    lines.append(r"\begin{longtable}{@{}>{\centering\arraybackslash}p{2.0cm}p{11.0cm}>{\centering\arraybackslash}p{2.0cm}@{}}")
    lines.append(r"    \arrayrulecolor{white}")
    lines.append(r"    \hline")
    lines.append(r"    \textbf{CHAPTER NO} & \multicolumn{1}{c}{\textbf{PARTICULARS}} & \textbf{PAGE NO} \\")
    lines.append(r"    \hline")
    lines.append(r"    \endfirsthead")
    lines.append(r"    \hline")
    lines.append(r"    \textbf{CHAPTER NO} & \multicolumn{1}{c}{\textbf{PARTICULARS}} & \textbf{PAGE NO} \\")
    lines.append(r"    \hline")
    lines.append(r"    \endhead")

    for (level, number, name, page) in entries:
        # Force a page break before Chapter 7 and APPENDIX in TOC
        if (level == "section" and number == "7") or name.upper() == "APPENDIX":
            lines.append(r"\noalign{\newpage}")



        if level == "section":
            num_cell = rf"{number}"
            name_cell = rf"\textbf{{{name}}}"
            page_cell = rf"{page}"
            lines.append(f"    \\centering {num_cell} & {name_cell} & {page_cell} \\\\ \\hline")
        elif level == "subsection":
            # number is already embedded in `name` (e.g. "1.1 Objective of the Project")
            # just indent it in the PARTICULARS column; leave CHAPTER NO empty
            name_cell = rf"\hspace{{1.0em}}{name}"
            lines.append(f"     & {name_cell} & {page} \\\\ \\hline")

    lines.append(r"\end{longtable}")
    lines.append(r"\arrayrulecolor{black}")
    lines.append(r"\clearpage")
    return "\n".join(lines)


def parse_lot(lot_file):
    """Parse a .lot file and return a list of (number, caption, page) tuples."""
    entries = []
    if not os.path.exists(lot_file):
        return entries
    with open(lot_file, "r") as f:
        for line in f:
            line = line.strip()
            if not line.startswith(r"\contentsline"):
                continue
            # Format: \contentsline {table}{\numberline {2.1}{Caption Text}}{4}{table.2.1}%
            num_m = re.search(r'numberline \{([^}]+)\}', line)
            cap_m = re.search(r'numberline \{[^}]+\}\{([^}]*)\}', line)
            # Page is between }{ after the caption block
            page_m = re.search(r'\}\}\{(\d+)\}', line)
            if num_m and cap_m and page_m:
                number = num_m.group(1).strip()
                caption = cap_m.group(1).strip()
                page = page_m.group(1).strip()
                entries.append((number, caption, page))
    return entries


def parse_lof(lof_file):
    """Parse a .lof file and return a list of (number, caption, page) tuples."""
    entries = []
    if not os.path.exists(lof_file):
        return entries
    with open(lof_file, "r") as f:
        for line in f:
            line = line.strip()
            if not line.startswith(r"\contentsline"):
                continue
            # Format: \contentsline {figure}{\numberline {3.1}{\ignorespaces Caption}}{9}{figure.3.1}%
            num_m = re.search(r'numberline \{([^}]+)\}', line)
            cap_m = re.search(r'numberline \{[^}]+\}\{([^}]*)\}', line)
            page_m = re.search(r'\}\}\{(\d+)\}', line)
            if num_m and cap_m and page_m:
                number = num_m.group(1).strip()
                caption = cap_m.group(1).strip()
                # Remove \ignorespaces if present
                caption = caption.replace(r'\ignorespaces ', '').replace(r'\ignorespaces', '')
                page = page_m.group(1).strip()
                entries.append((number, caption, page))
    return entries


def build_lot_table(entries):
    """Build a LaTeX longtable string for List of Tables."""
    lines = []
    lines.append(r"\begin{center}")
    lines.append(r"{\large\bfseries LIST OF TABLES}")
    lines.append(r"\end{center}")
    lines.append(r"\vspace{1em}")
    lines.append(r"\begin{longtable}{>{\centering\arraybackslash}p{2.5cm}p{11.0cm}>{\centering\arraybackslash}p{2.0cm}}")
    lines.append(r"    \arrayrulecolor{white}")
    lines.append(r"    \hline")
    lines.append(r"    \textbf{TABLE NO} & \multicolumn{1}{c}{\textbf{TABLE NAME}} & \textbf{PAGE NO} \\")
    lines.append(r"    \hline")
    lines.append(r"    \endfirsthead")
    lines.append(r"    \hline")
    lines.append(r"    \textbf{TABLE NO} & \multicolumn{1}{c}{\textbf{TABLE NAME}} & \textbf{PAGE NO} \\")
    lines.append(r"    \hline")
    lines.append(r"    \endhead")
    for (number, caption, page) in entries:
        lines.append(f"    \\centering {number} & {caption} & {page} \\\\ \\hline")
    lines.append(r"\end{longtable}")
    lines.append(r"\arrayrulecolor{black}")
    lines.append(r"\clearpage")
    return "\n".join(lines)


def build_lof_table(entries):
    """Build a LaTeX longtable string for List of Figures."""
    lines = []
    lines.append(r"\begin{center}")
    lines.append(r"{\large\bfseries LIST OF FIGURES}")
    lines.append(r"\end{center}")
    lines.append(r"\vspace{1em}")
    lines.append(r"\begin{longtable}{>{\centering\arraybackslash}p{2.5cm}p{11.0cm}>{\centering\arraybackslash}p{2.0cm}}")
    lines.append(r"    \arrayrulecolor{white}")
    lines.append(r"    \hline")
    lines.append(r"    \textbf{FIGURE NO} & \multicolumn{1}{c}{\textbf{FIGURE NAME}} & \textbf{PAGE NO} \\")
    lines.append(r"    \hline")
    lines.append(r"    \endfirsthead")
    lines.append(r"    \hline")
    lines.append(r"    \textbf{FIGURE NO} & \multicolumn{1}{c}{\textbf{FIGURE NAME}} & \textbf{PAGE NO} \\")
    lines.append(r"    \hline")
    lines.append(r"    \endhead")
    for (number, caption, page) in entries:
        lines.append(f"    \\centering {number} & {caption} & {page} \\\\ \\hline")
    lines.append(r"\end{longtable}")
    lines.append(r"\arrayrulecolor{black}")
    lines.append(r"\clearpage")
    return "\n".join(lines)


def inject_toc_into_tex(tex_file, toc_table_tex):
    """Replace \tableofcontents in the .tex file with the actual table."""
    with open(tex_file, "r") as f:
        content = f.read()
    # Replace the \tableofcontents command with our pre-built table
    new_content = content.replace(r"\tableofcontents", toc_table_tex, 1)
    with open(tex_file, "w") as f:
        f.write(new_content)


def process_tex_tables(tex_file):
    """Add borders and adjust width to 80% for all tables in the .tex file."""
    if not os.path.exists(tex_file):
        return
    with open(tex_file, "r") as f:
        content = f.read()

    def process_table(table_match):
        table_body = table_match.group(0)
        
        # Move caption to the bottom if present
        caption_match = re.search(r"\\caption\{((?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*)\}(\\label\{.*?\})?(?:\\tabularnewline)?", table_body)
        caption_text = None
        label_text = ""
        if caption_match:
            caption_full = caption_match.group(0)
            caption_text = caption_match.group(1)
            label_text = caption_match.group(2) or ""
            
            # Remove from original position
            table_body = table_body.replace(caption_full, "")
            
            # Also remove any leftover \tabularnewline right after the removed caption
            table_body = re.sub(r"(\\begin\{longtable\}(?:\[.*?\])?\{.*?\})\s*(?:\\tabularnewline)?\s*(?:\\noalign\{\})?", r"\1", table_body, flags=re.DOTALL)

        # Make header rows bold and centered vertically/horizontally
        nested_braces_regex = r"\\begin\{longtable\}(\[.*?\])?\{((?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*)\}"
        spec_match = re.search(nested_braces_regex, table_body)
        num_cols = 1
        if spec_match:
            spec = spec_match.group(2).strip()
            num_cols = spec.count('p{')
            if num_cols == 0:
                num_cols = len(re.findall(r"[lcr]", re.sub(r"@{.*?\}", "", spec)))
            if num_cols == 0:
                num_cols = 1
        col_width = 0.80 / num_cols

        def bold_header_row(row_text):
            cells = re.split(r'(?<!\\)&', row_text)
            bolded_cells = []
            for i, cell in enumerate(cells):
                stripped = cell.strip()
                if stripped.startswith(r"\textbf{") and stripped.endswith("}"):
                    stripped = stripped[8:-1].strip()
                
                # Strip out pandoc's minipage and raggedright which break centering
                stripped = re.sub(r"\\begin\{minipage\}\[.*?\]\{.*?\}", "", stripped)
                stripped = re.sub(r"\\end\{minipage\}", "", stripped)
                stripped = re.sub(r"\\raggedright\b", "", stripped)
                stripped = re.sub(r"\\noalign\{\}", "", stripped)
                stripped = stripped.strip()
                
                # Determine vertical borders for multicolumn (vertical middle-aligned m{...} and centered)
                border_spec = "|" if i == 0 else ""
                border_spec += f">{{\\centering\\arraybackslash}}m{{{col_width:.3f}\\linewidth}}|"
                
                # Apply multicolumn to force borders and bold
                bolded_cells.append(rf"\multicolumn{{1}}{{{border_spec}}}{{\textbf{{{stripped}}}}}")
            return " & ".join(bolded_cells)

        table_body = re.sub(r"\\toprule\s*(.*?)\s*(?:\\\\|\\tabularnewline)\s*\\midrule", 
                            lambda m: rf"\toprule {bold_header_row(m.group(1))} \\ \midrule", 
                            table_body, flags=re.DOTALL)

        # 1. Add vertical lines to longtable spec
        def replace_spec(match):
            options = match.group(1) or ""
            spec = match.group(2).strip()
            
            # Count columns: count occurrences of 'p{' which Pandoc uses for width-constrained tables
            num_cols = spec.count('p{')
            if num_cols == 0:
                # Fallback for simple lcr tables (strip out other formatting first)
                num_cols = len(re.findall(r"[lcr]", re.sub(r"@{.*?\}", "", spec)))
            
            if num_cols == 0:
                # Absolute fallback if we can't count columns
                return match.group(0)
            
            # Calculate width (80% to be extremely safe against right-side overflow)
            width = 0.80 / num_cols
            # Build a strict grid spec with vertical bars
            new_spec = "|" + "|".join([rf">{{\raggedright\arraybackslash}}p{{{width:.3f}\linewidth}}" for _ in range(num_cols)]) + "|"
            # Return begin statement with an immediate hline for the top border
            return rf"\begin{{longtable}}{options}{{{new_spec}}} \n \hline"

        # Apply to the \begin{longtable} block
        # This regex handles nested braces up to 2 levels deep (common in Pandoc specs)
        nested_braces_regex = r"\\begin\{longtable\}(\[.*?\])?\{((?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*)\}"
        table_body = re.sub(nested_braces_regex, replace_spec, table_body, flags=re.DOTALL, count=1)

        # 2. Add horizontal lines (replace booktabs with standard hline)
        table_body = table_body.replace(r"\toprule", r"\hline")
        table_body = table_body.replace(r"\midrule", r"\hline")
        table_body = table_body.replace(r"\bottomrule", r"\hline")
        
        # 3. Add \hline after every row
        # Ensure every \\ is followed by \hline if not already there
        table_body = re.sub(r"\\\\(?!\s*\\hline)", r"\\\\ \\hline", table_body)
        
        # Insert caption inside \endlastfoot if present, otherwise append before \end{longtable}
        if caption_text is not None:
            if r"\endlastfoot" in table_body:
                table_body = table_body.replace(
                    r"\endlastfoot", 
                    rf"\noalign{{\vspace{{15pt}}}}\caption{{{caption_text}}}{label_text} \\" + "\n" + r"\endlastfoot"
                )
            else:
                table_body = re.sub(
                    r"\\end\{longtable\}", 
                    lambda m: rf"\noalign{{\vspace{{15pt}}}}\caption{{{caption_text}}}{label_text} \\" + "\n" + r"\end{longtable}", 
                    table_body
                )

        # 4. Wrap the table in a center environment, with needspace to keep heading+table together
        if not table_body.strip().startswith(r"\begin{center}"):
            table_body = r"\needspace{8\baselineskip}" + "\n" + r"\begin{center}" + "\n" + table_body + "\n" + r"\end{center}"
        
        return table_body

    # Apply processing only within longtable environments
    content = re.sub(r"\\begin\{longtable\}.*?\\end\{longtable\}", process_table, content, flags=re.DOTALL)

    with open(tex_file, "w") as f:
        f.write(content)


def generate_pdf():
    docs_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(docs_dir)

    # 1. Find all markdown files in order
    md_files = sorted([f for f in os.listdir(".") if f.endswith(".md") and f[0].isdigit()])
    if not md_files:
        print("No markdown files found.")
        return

    print(f"Combining {len(md_files)} files and processing breaks...")
    
    combined_md = "combined_docs.md"
    with open(combined_md, "w") as outfile:
        for f in md_files:
            with open(f, "r") as infile:
                content = infile.read()
                # Replace the manual break keyword with LaTeX command
                content = content.replace("{section break}", r"\newpage")
                
                # Strip bold formatting except in headings and code blocks
                processed_lines = []
                in_code_block = False
                for line in content.splitlines():
                    if line.strip().startswith("```"):
                        in_code_block = not in_code_block
                        processed_lines.append(line)
                        continue
                    
                    # Keep bolding ONLY in code blocks and headings
                    if in_code_block or line.strip().startswith("#"):
                        if not in_code_block and line.strip().startswith("# ") and "{-}" not in line:
                            heading_text = line.strip()[2:].strip().upper()
                            skip_numbering = ["ABSTRACT", "APPENDIX", "REFERENCE", "REFERENCES", "TABLE OF CONTENTS"]
                            if heading_text in skip_numbering:
                                line = line.rstrip() + " {-}\n"
                        
                        if not in_code_block and line.strip().startswith("#"):
                            m = re.match(r'^(#+)\s*(.*)', line.strip())
                            if m:
                                hashes, text = m.groups()
                                clean_text = text.replace("{-}", "").strip()
                                if clean_text.isupper():
                                    small_words = {'of', 'the', 'and', 'for', 'in', 'on', 'at', 'to', 'with', 'a', 'an'}
                                    res = []
                                    for i, w in enumerate(text.split()):
                                        lw = w.lower()
                                        if i > 0 and lw in small_words:
                                            res.append(lw)
                                        else:
                                            res.append(w.capitalize())
                                    line = f"{hashes} {' '.join(res)}\n"
                                    
                        processed_lines.append(line)
                    else:
                        # Strip **bold** and __bold__ from normal paragraphs and lists
                        line = re.sub(r"\*\*(.*?)\*\*", r"\1", line)
                        line = re.sub(r"__(.*?)__", r"\1", line)
                        processed_lines.append(line)
                
                content = "\n".join(processed_lines)
                outfile.write(content)
                outfile.write("\n\n")

    # 2. LaTeX header
    # ... (header_tex remains the same)
    # ...
    
    header_tex = r"""
\usepackage{times}
\usepackage{pdfpages}
\usepackage{etoolbox}
\usepackage{geometry}
\geometry{a4paper, top=3cm, bottom=2.5cm, left=3.5cm, right=2cm}
\usepackage{setspace}
\onehalfspacing
\usepackage{titlesec}
\usepackage{fancyhdr}
\usepackage{longtable}
\usepackage{array}
\usepackage{colortbl}
\usepackage{fancyvrb}
\usepackage{fvextra}
\usepackage[font=footnotesize, labelfont=bf, textfont=bf, skip=15pt]{caption}
\usepackage{float}
\floatplacement{figure}{H}
\usepackage{needspace}
\usepackage{chngcntr}
\counterwithin{table}{section}
\counterwithin{figure}{section}
\renewcommand{\labelitemii}{$\circ$}

% Force small font for all verbatim blocks to prevent overflow
\RecustomVerbatimEnvironment{verbatim}{Verbatim}{fontsize=\small,breaklines=true}
\DefineVerbatimEnvironment{Highlighting}{Verbatim}{fontsize=\small,breaklines=true,commandchars=\\\{\}}

% Page number at bottom center, default style has NO running header
\pagestyle{fancy}
\fancyhf{}
\cfoot{\thepage}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\sectionmark}[1]{\markboth{#1}{}}
\pagenumbering{gobble}

% Ensure both \section and \section* update the header mark and print the heading at the top of the content page
\makeatletter
\let\oldsection\section
\renewcommand{\section}{\@ifstar\starsection\nostarsection}
\def\starsection#1{%
  \oldsection*{#1}%
  \sectionmark{#1}%
  \vspace*{-0.54cm}%
  \begin{center}%
  {\fontsize{18}{22}\selectfont\bfseries{#1}}%
  \end{center}%
  \vspace*{0.5cm}%
}
\def\nostarsection{\@ifnextchar[\nostarsectionopt\nostarsectionnoopt}
\def\nostarsectionopt[#1]#2{%
  \oldsection[#1]{#2}%
  \sectionmark{#2}%
  \vspace*{-0.54cm}%
  \begin{center}%
  {\fontsize{18}{22}\selectfont\bfseries{#2}}%
  \end{center}%
  \vspace*{0.5cm}%
}
\def\nostarsectionnoopt#1{%
  \oldsection{#1}%
  \sectionmark{#1}%
  \vspace*{-0.54cm}%
  \begin{center}%
  {\fontsize{18}{22}\selectfont\bfseries{#1}}%
  \end{center}%
  \vspace*{0.5cm}%
}
\makeatother

% Chapter title page: centered vertically with "CHAPTER X" above title
\titleformat{\section}[display]
{\vspace*{2.5in}\centering\normalfont\fontsize{18}{22}\selectfont\bfseries\thispagestyle{plain}}
{CHAPTER \thesection}
{1pc}
{\MakeUppercase}
[\vfill\clearpage]

% Unnumbered sections (Abstract etc.) also get a centered title page
\titleformat{name=\section,numberless}[display]
{\vspace*{2.5in}\centering\normalfont\fontsize{18}{22}\selectfont\bfseries\thispagestyle{plain}}
{}
{1pc}
{\MakeUppercase}
[\vfill\clearpage]

% Subsections: NO label prefix because markdown headers already include numbers (e.g., "3.1 OVERVIEW")
\titleformat{\subsection}{\normalfont\fontsize{14}{16}\selectfont\bfseries}{}{0pt}{}
\titleformat{\subsubsection}{\normalfont\fontsize{14}{16}\selectfont\bfseries}{}{0pt}{}

% Page numbering starts at abstract

\setcounter{secnumdepth}{1}
\arrayrulecolor{black}
"""

    header_file = "header.tex"
    with open(header_file, "w") as f:
        f.write(header_tex)

    # Create a before_body file to include the front page
    before_body_file = "before_body.tex"
    with open(before_body_file, "w") as f:
        if os.path.exists("front_page.pdf"):
            # Use \includepdf to insert the front page
            # We use [pages=-] to include all pages if it's more than one, 
            # but usually it's just one.
            f.write(r"\includepdf[pages=-]{front_page.pdf}" + "\n")
        else:
            f.write("")

    tex_file = "Project_Documentation.tex"
    output_pdf = "Project_Documentation.pdf"
    aux_file = tex_file.replace(".tex", ".aux")
    toc_file = tex_file.replace(".tex", ".toc")
    lot_file = tex_file.replace(".tex", ".lot")
    lof_file = tex_file.replace(".tex", ".lof")
    log_file = tex_file.replace(".tex", ".log")
    out_file = tex_file.replace(".tex", ".out")

    # 3. Generate .tex via pandoc (using the combined file)
    cmd_tex = [
        "pandoc", combined_md,
        "-o", tex_file,
        "-H", header_file,
        "--include-before-body", before_body_file,
        "--toc",
        "--variable", "lot=true",
        "--variable", "lof=true",
        "--pdf-engine=pdflatex",
        "--variable", "fontsize=12pt",
        "--no-highlight",
    ]
    print("Generating LaTeX source...")
    result = subprocess.run(cmd_tex, capture_output=True, text=True)
    if result.returncode != 0:
        print("Pandoc error:", result.stderr)
        return

    # Post-process tables to add borders
    print("Adding borders to tables...")
    process_tex_tables(tex_file)

    # 4. Run pdflatex once to generate the .toc file
    print("Running pdflatex (Pass 1 — building TOC)...")
    subprocess.run(
        ["pdflatex", "-interaction=nonstopmode", tex_file],
        capture_output=True
    )

    # 5. Parse the .toc file
    print("Parsing TOC entries...")
    entries = parse_toc(toc_file)
    print(f"  Found {len(entries)} TOC entries.")

    if entries:
        # 6. Inject the TOC table into the .tex file
        toc_table_tex = build_toc_table(entries)
        inject_toc_into_tex(tex_file, toc_table_tex)
        print("Injected TOC table into LaTeX source.")
    else:
        print("Warning: No TOC entries found. The table will be empty.")

    # 6b. Parse and inject List of Tables
    lot_entries = parse_lot(lot_file)
    print(f"  Found {len(lot_entries)} table entries.")
    if lot_entries:
        lot_table_tex = build_lot_table(lot_entries)
        with open(tex_file, "r") as f:
            content = f.read()
        content = content.replace(r"\listoftables", lot_table_tex, 1)
        with open(tex_file, "w") as f:
            f.write(content)
        print("Injected List of Tables into LaTeX source.")

    # 6c. Parse and inject List of Figures
    lof_entries = parse_lof(lof_file)
    print(f"  Found {len(lof_entries)} figure entries.")
    if lof_entries:
        lof_table_tex = build_lof_table(lof_entries)
        with open(tex_file, "r") as f:
            content = f.read()
        content = content.replace(r"\listoffigures", lof_table_tex, 1)
        with open(tex_file, "w") as f:
            f.write(content)
        print("Injected List of Figures into LaTeX source.")

    # 7. Run pdflatex twice more to finalize cross-references
    print("Running pdflatex (Pass 2)...")
    subprocess.run(
        ["pdflatex", "-interaction=nonstopmode", tex_file],
        capture_output=True
    )
    print("Running pdflatex (Pass 3 — final)...")
    subprocess.run(
        ["pdflatex", "-interaction=nonstopmode", tex_file],
        capture_output=True
    )

    if os.path.exists(output_pdf):
        print(f"\nSuccess! PDF generated: {output_pdf}")
    else:
        print("\nError: PDF not generated. Check LaTeX log for details.")

    # 8. Cleanup temp files
    for f in [tex_file, aux_file, toc_file, lot_file, lof_file, log_file, out_file, header_file, combined_md, before_body_file]:
        if os.path.exists(f):
            os.remove(f)


if __name__ == "__main__":
    generate_pdf()
