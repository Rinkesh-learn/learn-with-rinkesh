// =========================================================
// Learn With Rinkesh — Excel Knowledge Hub articles
// Long-form, SEO-oriented content beyond formulas: macros,
// filters, formatting, data types, errors, and more.
// Each article's `visual` field is custom-built illustration
// HTML (not real Microsoft screenshots, for copyright safety).
// =========================================================

const ARTICLES = [
  {
    id: 'what-is-a-macro',
    title: 'What Is a Macro in Excel? A Complete Beginner\'s Guide',
    shortDesc: 'What macros actually are, why they save hours of repetitive work, and how to record your first one.',
    keywords: 'excel macro, what is a macro, record macro excel, automate excel tasks',
    icon: '🎬',
    videoUrl: null,
    visual1: `<div class="art-mock-ribbon"><div class="art-mock-tab active">Developer</div><div class="art-mock-tab">View</div></div><div class="art-mock-btn-row"><div class="art-mock-btn">⏺ Record Macro</div><div class="art-mock-btn">▶ Run</div><div class="art-mock-btn">✏️ Edit</div></div>`,
    visual2: `<div class="art-mock-steps"><div class="art-mock-step">1. Click Record</div><div class="art-mock-step">2. Do the task once</div><div class="art-mock-step">3. Click Stop</div><div class="art-mock-step">4. Replay anytime</div></div>`,
    content: `
<p>If you've ever formatted the same report, copied the same columns, or cleaned the same messy export every single week, a macro is the tool that ends that repetition for good.</p>

<h2>What is a macro, in plain English?</h2>
<p>A macro is a recorded sequence of actions in Excel — clicks, typing, formatting, formulas — that you can play back with a single button or shortcut key. Think of it like recording a voice memo, except instead of recording sound, Excel records exactly what you did on the spreadsheet, in order, so it can repeat those same steps on command.</p>
<p>Under the hood, Excel translates your actions into a programming language called VBA (Visual Basic for Applications). You don't need to know any code to use a basic macro — you just need to know how to click "Record."</p>

<h2>Why macros matter at work</h2>
<p>Macros exist to eliminate repetitive manual work. A few real examples:</p>
<ul>
<li>Formatting a new weekly sales report the same way every time — headers bolded, currency applied, borders added — in one click instead of five minutes of manual formatting</li>
<li>Cleaning up a raw data export from another system (removing blank rows, fixing date formats) before you can actually use it</li>
<li>Generating the same summary tab from raw data every month without rebuilding it from scratch</li>
</ul>
<p>If a task is exactly the same every time, it's a strong candidate for a macro.</p>

<h2>How to record your first macro</h2>
<p>You don't need to write any code to get started:</p>
<ol>
<li>Go to the <strong>View</strong> tab (or <strong>Developer</strong> tab if you have it enabled) and click <strong>Macros → Record Macro</strong></li>
<li>Give it a name (no spaces) and, optionally, assign a keyboard shortcut</li>
<li>Perform the exact steps you want repeated — formatting, typing, whatever it is</li>
<li>Click <strong>Stop Recording</strong> when you're done</li>
</ol>
<p>That's it. The next time you need those exact steps done, run the macro instead of doing it by hand.</p>

<h2>A word of caution</h2>
<p>Macros are powerful, which means a poorly recorded one can also apply the wrong formatting to the wrong range if your data layout changes. Always test a new macro on a copy of your file first, and keep macros simple and specific to one repeatable task rather than trying to make one macro do everything.</p>

<h2>When you're ready to go further</h2>
<p>Once recorded macros start feeling limiting, the next step is learning to read and lightly edit the VBA code Excel generates — but that's a topic for another day. For now, recording is more than enough to save real time on real repetitive tasks.</p>
`
  },

  {
    id: 'what-is-a-filter',
    title: 'What Is a Filter in Excel, and How Do You Use It?',
    shortDesc: 'How to hide the noise in a large dataset and see only the rows that actually matter, without deleting anything.',
    keywords: 'excel filter, how to filter data in excel, autofilter, filter rows excel',
    icon: '🔎',
    videoUrl: null,
    visual1: `<table class="art-mock-table"><tr><th>Region ▾</th><th>Sales ▾</th></tr><tr><td>North</td><td>4200</td></tr><tr class="art-mock-hidden"><td>South</td><td>1900</td></tr><tr><td>North</td><td>3800</td></tr></table>`,
    visual2: `<div class="art-mock-steps"><div class="art-mock-step">Select your data</div><div class="art-mock-step">Data → Filter</div><div class="art-mock-step">Click the ▾ arrow</div><div class="art-mock-step">Pick what to show</div></div>`,
    content: `
<p>A Filter is one of the most-used tools in Excel, and also one of the most misunderstood — many people confuse it with deleting rows. It doesn't delete anything. It just temporarily hides the rows you don't want to look at right now.</p>

<h2>What a filter actually does</h2>
<p>When you apply a Filter, Excel adds a small dropdown arrow to each column header. Clicking that arrow lets you choose which values should stay visible — everything else is hidden from view, not removed from the sheet. Turn the filter off, or clear it, and every row instantly comes back exactly as it was.</p>
<p>This makes filtering completely safe to experiment with — you can never accidentally lose data by filtering it.</p>

<h2>How to apply a filter</h2>
<ol>
<li>Click anywhere inside your data</li>
<li>Go to the <strong>Data</strong> tab and click <strong>Filter</strong> (or press <strong>Ctrl+Shift+L</strong>)</li>
<li>Dropdown arrows appear on every column header</li>
<li>Click any arrow to filter that column — uncheck values you want hidden, or use text/number filters for conditions like "greater than" or "contains"</li>
</ol>

<h2>A real example</h2>
<p>Imagine a spreadsheet with 2,000 rows of sales data across five regions. You only need to review the North region's numbers today. Instead of scrolling and hunting, you filter the Region column to show only "North" — the other 1,600-odd rows disappear from view instantly, and you're looking at exactly what you need.</p>

<h2>Filter vs. Sort — what's the difference?</h2>
<p>These two get confused constantly. <strong>Sort</strong> rearranges every row into a new order (like largest to smallest). <strong>Filter</strong> hides rows entirely, without changing the order of what remains. You can use both together — filter down to just what you need, then sort that smaller set.</p>

<h2>Clearing a filter</h2>
<p>To bring every row back, click the filter dropdown and choose <strong>Clear Filter</strong>, or turn off Filter mode entirely from the Data tab. Nothing is ever lost — it was only ever hidden.</p>
`
  },

  {
    id: 'currency-formatting',
    title: 'How to Add Currency Formatting in Excel (₹, $, € and More)',
    shortDesc: 'Turn plain numbers into properly formatted currency values, and understand why the underlying number never actually changes.',
    keywords: 'excel currency format, how to add rupee symbol excel, currency formatting excel',
    icon: '💰',
    videoUrl: null,
    visual1: `<table class="art-mock-table"><tr><th>Before</th><th>After</th></tr><tr><td>55000</td><td class="art-mock-highlight">₹55,000.00</td></tr><tr><td>1200.5</td><td class="art-mock-highlight">$1,200.50</td></tr></table>`,
    visual2: `<div class="art-mock-steps"><div class="art-mock-step">Select the cells</div><div class="art-mock-step">Ctrl+1 → Format Cells</div><div class="art-mock-step">Choose Currency</div><div class="art-mock-step">Pick your symbol</div></div>`,
    content: `
<p>Currency formatting is one of those small details that instantly makes a spreadsheet look professional — and it's easy to get right once you understand what's actually happening underneath.</p>

<h2>The key thing to understand first</h2>
<p>Applying currency formatting only changes how a number <em>looks</em> — it does not change the actual value stored in the cell. A cell showing <strong>₹55,000.00</strong> still contains the plain number <strong>55000</strong> underneath. This matters because formulas referencing that cell still work with the real number, formatting or not.</p>

<h2>How to apply currency formatting</h2>
<ol>
<li>Select the cells you want to format</li>
<li>Press <strong>Ctrl+1</strong> to open Format Cells (or right-click → Format Cells)</li>
<li>Choose the <strong>Currency</strong> or <strong>Accounting</strong> category</li>
<li>Pick your currency symbol (₹, $, €, £, and many more) and how many decimal places you want</li>
<li>Click OK</li>
</ol>
<p>There's also a quick shortcut: <strong>Ctrl+Shift+$</strong> applies a default currency format instantly, without opening any dialog.</p>

<h2>Currency vs. Accounting format — what's the difference?</h2>
<p><strong>Currency</strong> format puts the symbol directly next to the number (₹55,000.00). <strong>Accounting</strong> format aligns the symbol to the left edge of the cell and the numbers to the right, which lines up much more neatly in a column of many values — this is the format most finance teams actually prefer for reports.</p>

<h2>Formatting negative currency values</h2>
<p>Both formats let you choose how negatives display — with a minus sign, in red, or in parentheses like <strong>(₹1,200.00)</strong>, which is the traditional accounting convention for a negative or loss figure.</p>

<h2>A common mistake to avoid</h2>
<p>Never manually type a currency symbol directly into a cell along with the number (like typing "₹55000" as text). That turns the value into text, not a number — formulas like SUM will silently ignore it. Always type the plain number and apply formatting separately.</p>
`
  },

  {
    id: 'excel-error-types',
    title: 'Every Excel Error Explained: #N/A, #VALUE!, #REF! and More',
    shortDesc: 'What each error message actually means, why it happens, and the fastest way to fix it.',
    keywords: 'excel errors explained, #N/A error, #VALUE error excel, excel error types',
    icon: '⚠️',
    videoUrl: null,
    visual1: `<div class="art-mock-error-grid">
      <div class="art-mock-error">#N/A</div>
      <div class="art-mock-error">#VALUE!</div>
      <div class="art-mock-error">#REF!</div>
      <div class="art-mock-error">#DIV/0!</div>
      <div class="art-mock-error">#NAME?</div>
      <div class="art-mock-error">#NUM!</div>
    </div>`,
    visual2: `<div class="art-mock-steps"><div class="art-mock-step">Read the error type</div><div class="art-mock-step">Check the formula's inputs</div><div class="art-mock-step">Fix the actual cause</div><div class="art-mock-step">Wrap in IFERROR if needed</div></div>`,
    content: `
<p>Every Excel error message is actually a clue, not just a red flag — each one tells you specifically what went wrong. Here's what each one really means.</p>

<h2>#N/A — "Not Available"</h2>
<p>The most common lookup error. It means a lookup formula (VLOOKUP, MATCH, XLOOKUP) searched for a value and genuinely couldn't find it in the range you gave it. Usually caused by a typo, extra spaces, or the value legitimately not existing in the source data.</p>

<h2>#VALUE! — Wrong type of data</h2>
<p>Appears when a formula receives the wrong kind of input — most often, trying to do math on text. Adding a number to a cell that contains the word "N/A" as text, for example, throws #VALUE!.</p>

<h2>#REF! — Invalid cell reference</h2>
<p>Means a formula is pointing to a cell that no longer exists — usually because a row, column, or sheet the formula depended on was deleted.</p>

<h2>#DIV/0! — Division by zero</h2>
<p>Exactly what it says: the formula tried to divide by zero, or by a blank cell (which Excel treats as zero). Very common when calculating percentages or averages on data that hasn't been fully entered yet.</p>

<h2>#NAME? — Excel doesn't recognize something</h2>
<p>Almost always a typo in a function name (like <code>=VLOOKPU()</code> instead of <code>=VLOOKUP()</code>), or a missing set of quotation marks around text.</p>

<h2>#NUM! — Invalid numeric value</h2>
<p>Happens when a formula receives a number it mathematically can't handle — like asking for the square root of a negative number.</p>

<h2>#NULL! — Wrong range syntax</h2>
<p>A rare one, usually caused by using a space instead of a comma or colon between two ranges that don't actually intersect.</p>

<h2>The universal fix: IFERROR</h2>
<p>Rather than chasing down every possible error individually, wrapping a formula in <strong>IFERROR</strong> lets you show a clean fallback value instead of any error message — but it's worth diagnosing the real cause first, since IFERROR can also hide a genuine data problem you'd want to know about.</p>
`
  },

  {
    id: 'change-data-types',
    title: 'How to Change Data Types in Excel (Text, Number, Date)',
    shortDesc: 'Why a "number" that behaves like text breaks your formulas, and exactly how to fix it.',
    keywords: 'excel data types, convert text to number excel, change data type excel',
    icon: '🔤',
    videoUrl: null,
    visual1: `<div class="art-mock-chip-row">
      <span class="art-mock-chip" style="background:#1C6B41;">123 — Number</span>
      <span class="art-mock-chip" style="background:#C9971E;">"123" — Text</span>
      <span class="art-mock-chip" style="background:#2F80C9;">01-Jan-26 — Date</span>
    </div>`,
    visual2: `<div class="art-mock-steps"><div class="art-mock-step">Select the range</div><div class="art-mock-step">Data → Text to Columns</div><div class="art-mock-step">Click Finish</div><div class="art-mock-step">Excel converts to real numbers</div></div>`,
    content: `
<p>One of the most common "why isn't my formula working" problems isn't a formula problem at all — it's a data type problem. A number that <em>looks</em> like a number can still be stored as text, and Excel treats those two completely differently.</p>

<h2>How to tell what type a cell actually is</h2>
<p>Numbers and dates align to the <strong>right</strong> side of a cell by default. Text aligns to the <strong>left</strong>. If a column of numbers looks left-aligned, that's usually your first sign they're secretly stored as text — most often after importing data from another system, like a CSV export.</p>

<h2>Why this breaks things</h2>
<p>SUM, AVERAGE, and most other numeric formulas silently ignore text values instead of calculating them. A column that looks like it should total ₹50,000 can add up to ₹0 if every value is actually text — with no error message to warn you.</p>

<h2>How to convert text to real numbers</h2>
<p>The fastest fix for a whole column:</p>
<ol>
<li>Select the range</li>
<li>Go to <strong>Data → Text to Columns</strong></li>
<li>Choose "Delimited," click Next twice, then <strong>Finish</strong></li>
</ol>
<p>This forces Excel to re-evaluate each cell and convert genuine numbers stored as text back into real numbers — even though you're not actually splitting anything into columns.</p>
<p>Alternatively, multiplying by 1 (<code>=A1*1</code>) or using <code>=VALUE(A1)</code> in a helper column achieves the same result.</p>

<h2>Converting text to real dates</h2>
<p>Dates stored as text (like "12/31/2025" typed after an import) won't sort correctly or work in date formulas. Use <code>=DATEVALUE(A1)</code> to convert text into a real date value, then format the result as a date.</p>

<h2>Forcing a number to be treated as text</h2>
<p>Sometimes you want the opposite — like preserving a phone number's leading zero. Format the cell as <strong>Text</strong> before typing the value, or prefix it with an apostrophe (<code>'0123456789</code>), which tells Excel to store it exactly as typed.</p>
`
  },

  {
    id: 'conditional-formatting',
    title: 'What Is Conditional Formatting in Excel, and How Do You Use It?',
    shortDesc: 'Make problems visible at a glance by having Excel color-code your data automatically, based on rules you set.',
    keywords: 'conditional formatting excel, highlight cells excel, excel color rules',
    icon: '🎨',
    videoUrl: null,
    visual1: `<table class="art-mock-table"><tr><th>Sales</th></tr><tr><td class="art-mock-red">3200</td></tr><tr><td class="art-mock-green">8900</td></tr><tr><td class="art-mock-green">7100</td></tr><tr><td class="art-mock-red">2400</td></tr></table>`,
    visual2: `<div class="art-mock-steps"><div class="art-mock-step">Select the range</div><div class="art-mock-step">Home → Conditional Formatting</div><div class="art-mock-step">Set your rule</div><div class="art-mock-step">Choose a format/color</div></div>`,
    content: `
<p>Conditional Formatting automatically changes how a cell looks — its color, font, or icon — based on rules you define, so problems and highlights are visible at a glance instead of requiring you to read every single number.</p>

<h2>Why it's genuinely useful</h2>
<p>A table of 500 sales figures is hard to scan manually. The same table with every figure below target automatically shown in red takes about two seconds to read. That's the entire point — conditional formatting turns raw numbers into an instantly readable picture.</p>

<h2>How to apply a basic rule</h2>
<ol>
<li>Select the range you want to evaluate</li>
<li>Go to <strong>Home → Conditional Formatting</strong></li>
<li>Choose a rule type — "Highlight Cells Rules" for simple conditions like "greater than," or "Color Scales" and "Data Bars" for a more visual gradient effect</li>
<li>Set your condition and pick a format or color</li>
</ol>

<h2>Common real-world uses</h2>
<ul>
<li>Highlighting overdue dates in red on a project tracker</li>
<li>Coloring sales figures green above target and red below it</li>
<li>Using data bars to visually compare values in a column without needing a separate chart</li>
<li>Flagging duplicate entries in a list automatically</li>
</ul>

<h2>Using a formula-based rule</h2>
<p>For more control, choose "Use a formula to determine which cells to format." This lets you build a condition referencing other cells — for example, highlighting an entire row red if that row's status column says "Overdue," rather than just formatting a single cell in isolation.</p>

<h2>Managing and removing rules</h2>
<p>Go to <strong>Conditional Formatting → Manage Rules</strong> to see, edit, or delete every rule applied to a sheet — useful when a cell is formatted unexpectedly and you need to find out why.</p>
`
  },

  {
    id: 'data-validation',
    title: 'What Is Data Validation in Excel? Stop Bad Data Before It Starts',
    shortDesc: 'Build dropdown lists and input rules that prevent typos and invalid entries before they ever make it into your sheet.',
    keywords: 'excel data validation, dropdown list excel, restrict cell input excel',
    icon: '✅',
    videoUrl: null,
    visual1: `<div class="art-mock-dropdown"><span>Status</span><div class="art-mock-select">Active ▾</div><div class="art-mock-dropdown-list"><div>Active</div><div>Inactive</div><div>Pending</div></div></div>`,
    visual2: `<div class="art-mock-steps"><div class="art-mock-step">Select the cells</div><div class="art-mock-step">Data → Data Validation</div><div class="art-mock-step">Choose "List"</div><div class="art-mock-step">Type your allowed values</div></div>`,
    content: `
<p>Data Validation restricts what can be typed into a cell in the first place — instead of cleaning up bad data after the fact, you prevent it from ever being entered.</p>

<h2>Why this matters more than it seems</h2>
<p>A "Department" column where people freely type will end up with "Finance," "finance," "FINANCE," and "Fin." scattered across the same sheet — and every formula that groups or counts by department will now treat those as four different values. Data Validation stops that problem before it starts.</p>

<h2>How to create a dropdown list</h2>
<ol>
<li>Select the cell or range where you want the restriction</li>
<li>Go to <strong>Data → Data Validation</strong></li>
<li>Under "Allow," choose <strong>List</strong></li>
<li>Type your allowed values separated by commas (e.g. <code>Active, Inactive, Pending</code>), or reference a range containing those values</li>
</ol>
<p>Now that cell shows a small dropdown arrow, and only the values you specified can be selected.</p>

<h2>Other types of validation rules</h2>
<ul>
<li><strong>Whole number / Decimal</strong> — only allows numbers within a range you set (e.g. an age must be between 18 and 65)</li>
<li><strong>Date</strong> — only allows dates within a specific window</li>
<li><strong>Text length</strong> — caps how many characters can be entered, useful for fields like a fixed-length ID</li>
<li><strong>Custom formula</strong> — the most flexible option, letting you write your own condition for what counts as valid</li>
</ul>

<h2>Adding a helpful input message</h2>
<p>Under the "Input Message" tab in the same dialog, you can add a small tooltip that appears when someone clicks the cell — a good way to explain exactly what's expected before they even try to type something invalid.</p>

<h2>Custom error alerts</h2>
<p>The "Error Alert" tab lets you write your own message shown when someone enters something that doesn't pass validation — far more helpful than Excel's generic default warning.</p>
`
  },

  {
    id: 'freeze-panes',
    title: 'How to Freeze Panes in Excel (Keep Headers Visible While Scrolling)',
    shortDesc: 'Stop losing track of which column is which every time you scroll through a large spreadsheet.',
    keywords: 'freeze panes excel, freeze header row excel, lock rows excel',
    icon: '📌',
    videoUrl: null,
    visual1: `<table class="art-mock-table"><tr><th>Name</th><th>Dept</th><th>Salary</th></tr><tr class="art-mock-scrolled"><td>...</td><td>...</td><td>...</td></tr></table><div class="art-mock-freeze-label">↑ Header row stays visible while the rest scrolls</div>`,
    visual2: `<div class="art-mock-steps"><div class="art-mock-step">Click below the header row</div><div class="art-mock-step">View → Freeze Panes</div><div class="art-mock-step">Choose "Freeze Top Row"</div><div class="art-mock-step">Scroll — headers stay put</div></div>`,
    content: `
<p>On a spreadsheet with hundreds of rows, scrolling down means losing sight of the column headers — leaving you guessing which column is which. Freeze Panes fixes this by locking specific rows or columns in place while the rest of the sheet scrolls freely.</p>

<h2>How to freeze just the top row</h2>
<ol>
<li>Go to the <strong>View</strong> tab</li>
<li>Click <strong>Freeze Panes → Freeze Top Row</strong></li>
</ol>
<p>That's it — row 1 now stays fixed at the top no matter how far down you scroll.</p>

<h2>Freezing the first column instead</h2>
<p>Useful when you have a wide sheet and need to keep track of which row (like an employee name) you're looking at while scrolling sideways through many columns. Choose <strong>Freeze Panes → Freeze First Column</strong> the same way.</p>

<h2>Freezing both rows and columns at once</h2>
<p>For full control, click the specific cell just below and to the right of what you want frozen — for example, click cell B2 to freeze both row 1 and column A simultaneously — then choose <strong>Freeze Panes → Freeze Panes</strong> (the first option). Everything above and to the left of your click point locks in place.</p>

<h2>Unfreezing</h2>
<p>Go back to <strong>View → Freeze Panes → Unfreeze Panes</strong> to remove the lock and return to normal scrolling.</p>

<h2>Freeze Panes vs. Split</h2>
<p>Excel also has a "Split" option nearby, which is different — Split divides the window into separate scrollable sections rather than locking anything in place. Freeze Panes is almost always what people actually want when headers keep disappearing.</p>
`
  },

  {
    id: 'excel-tables',
    title: 'What Are Excel Tables, and Why They\'re Better Than a Plain Range',
    shortDesc: 'Turn a normal range of data into a smart Table that expands automatically and makes formulas easier to read.',
    keywords: 'excel table, insert table excel, excel structured references',
    icon: '📋',
    videoUrl: null,
    visual1: `<table class="art-mock-table art-mock-real-table"><tr><th>Region ▾</th><th>Sales ▾</th></tr><tr><td>North</td><td>4200</td></tr><tr><td>South</td><td>3100</td></tr><tr class="art-mock-new-row"><td>+ new row auto-included</td><td></td></tr></table>`,
    visual2: `<div class="art-mock-steps"><div class="art-mock-step">Select your data</div><div class="art-mock-step">Insert → Table</div><div class="art-mock-step">Confirm the range</div><div class="art-mock-step">Data now auto-expands</div></div>`,
    content: `
<p>An Excel Table isn't just a formatting style — it's a distinct object with real functional benefits over a plain range of cells, especially for anyone building dashboards, PivotTables, or reports that need to keep growing.</p>

<h2>How to create one</h2>
<ol>
<li>Click anywhere inside your data</li>
<li>Go to <strong>Insert → Table</strong> (or press <strong>Ctrl+T</strong>)</li>
<li>Confirm the range and check "My table has headers" if it applies</li>
</ol>

<h2>The biggest benefit: automatic expansion</h2>
<p>Type a new row directly below a Table, and the Table automatically expands to include it — formulas, formatting, and filters all extend to the new row instantly. A PivotTable or chart built from that Table's range will pick up new rows automatically too, without you needing to manually update any reference.</p>

<h2>Built-in filtering and sorting</h2>
<p>Every Table automatically gets filter dropdown arrows on its headers — no need to manually apply Filter separately.</p>

<h2>Structured references make formulas more readable</h2>
<p>Inside a Table, formulas can reference column names instead of cell addresses — <code>=[Sales]-[Cost]</code> instead of <code>=B2-C2</code> — which stays accurate even if the Table's position on the sheet changes, and is far easier for someone else to read and understand.</p>

<h2>Automatic banded formatting</h2>
<p>Tables come with alternating row shading by default, making wide datasets easier to read across — and this formatting updates automatically as rows are added or removed.</p>

<h2>Renaming a Table</h2>
<p>Go to <strong>Table Design → Table Name</strong> to give it a meaningful name (like "SalesData") instead of the generic "Table1" — helpful once you start referencing it from formulas or PivotTables elsewhere.</p>
`
  },

  {
    id: 'named-ranges',
    title: 'What Are Named Ranges in Excel, and Why Use Them?',
    shortDesc: 'Replace confusing cell references like B2:B50 with a plain-English name that makes formulas instantly readable.',
    keywords: 'named ranges excel, define name excel, excel range name',
    icon: '🏷️',
    videoUrl: null,
    visual1: `<div class="art-mock-namebox-demo"><span class="art-mock-namebox-label">Name Box</span><div class="art-mock-namebox-input">SalesData</div></div><div class="art-mock-formula-compare"><div>=SUM(B2:B50)</div><div class="art-mock-arrow">→</div><div class="art-mock-highlight">=SUM(SalesData)</div></div>`,
    visual2: `<div class="art-mock-steps"><div class="art-mock-step">Select the range</div><div class="art-mock-step">Type a name in the Name Box</div><div class="art-mock-step">Press Enter</div><div class="art-mock-step">Use the name in formulas</div></div>`,
    content: `
<p>A Named Range gives a specific cell or range a plain-English name, so formulas can reference "SalesData" instead of "B2:B50" — a small change that makes a big difference in how readable and maintainable a spreadsheet is.</p>

<h2>How to create one</h2>
<p>The fastest way: select the range, click into the <strong>Name Box</strong> (the small box on the far left of the formula bar, just above column A), type a name with no spaces (like <code>SalesData</code>), and press Enter. The range is now named.</p>
<p>For more options — like scoping a name to a specific sheet only — use <strong>Formulas → Define Name</strong> instead.</p>

<h2>Why this is genuinely useful</h2>
<ul>
<li><strong>Readability</strong> — <code>=SUM(SalesData)</code> tells you exactly what it's calculating; <code>=SUM(B2:B50)</code> tells you nothing without checking the sheet</li>
<li><strong>Consistency</strong> — reference the same name in formulas across multiple sheets without worrying about exact cell coordinates</li>
<li><strong>Fewer broken formulas</strong> — if the named range needs to move, you update the name's definition once, and every formula using that name updates automatically</li>
</ul>

<h2>Navigating with named ranges</h2>
<p>Click the dropdown arrow on the Name Box to see every named range in the workbook — clicking one instantly selects and jumps to that range, which is a fast way to navigate a large, unfamiliar spreadsheet.</p>

<h2>Managing existing names</h2>
<p>Go to <strong>Formulas → Name Manager</strong> to see every named range in the workbook, edit what they refer to, or delete ones you no longer need.</p>

<h2>A common gotcha</h2>
<p>Named ranges don't automatically expand when you add new rows the way an Excel Table does — if your data grows, you'll need to update the name's range manually, or use a Table instead if the range needs to grow indefinitely.</p>
`
  },

  {
    id: 'sort-data',
    title: 'How to Sort Data in Excel (and Sort by Multiple Columns)',
    shortDesc: 'Beyond the basic A-Z button — how to sort by more than one column, by color, or in a custom order.',
    keywords: 'excel sort data, sort multiple columns excel, custom sort order excel',
    icon: '↕️',
    videoUrl: null,
    visual1: `<table class="art-mock-table"><tr><th>Dept</th><th>Name</th></tr><tr><td>Finance</td><td>Aman</td></tr><tr><td>Finance</td><td>Riya</td></tr><tr><td>HR</td><td>Karan</td></tr></table>`,
    visual2: `<div class="art-mock-steps"><div class="art-mock-step">Select your data</div><div class="art-mock-step">Data → Sort</div><div class="art-mock-step">Add sort levels</div><div class="art-mock-step">Click OK</div></div>`,
    content: `
<p>Sorting rearranges your rows into a chosen order — smallest to largest, A to Z, oldest to newest — and while the basic version is simple, most real-world reports need more control than a single click provides.</p>

<h2>The quick way: one-column sort</h2>
<p>Click anywhere in the column you want to sort by, then click the <strong>A-Z</strong> or <strong>Z-A</strong> button on the Data tab. Excel automatically sorts the entire connected table, keeping every row's data together correctly.</p>

<h2>Sorting by multiple columns</h2>
<p>Real reports often need this — for example, sorting first by Department, and within each department, by Salary from highest to lowest.</p>
<ol>
<li>Select your data and go to <strong>Data → Sort</strong></li>
<li>Set the first sort level (e.g. "Sort by Department, A to Z")</li>
<li>Click <strong>Add Level</strong> and set the second condition (e.g. "Then by Salary, Largest to Smallest")</li>
<li>Click OK</li>
</ol>
<p>Excel applies the sorts in order — first fully sorting by the top level, then sorting within each group by the next level down.</p>

<h2>Sorting by color or icon</h2>
<p>If you've used conditional formatting to color-code cells, the Sort dialog also lets you sort by cell color or icon, grouping all the red-flagged rows together, for example — accessible from the same "Sort by" dropdown, switching from "Values" to "Cell Color."</p>

<h2>Custom sort order</h2>
<p>Sometimes alphabetical isn't the order you actually want — like sorting by day of the week (Monday, Tuesday...) or by seniority level (Junior, Mid, Senior) rather than alphabetically. Choose <strong>Custom List</strong> in the Order dropdown to define your own sequence once, and reuse it any time.</p>

<h2>A safety tip</h2>
<p>Always select the full width of your data before sorting a single column manually — if you only select one column and sort it in isolation, that column's values shuffle out of sync with the rest of the row, silently corrupting your data. Using Data → Sort on a properly selected range (or an Excel Table) avoids this entirely.</p>
`
  }
];
