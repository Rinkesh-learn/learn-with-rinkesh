// =========================================================
// Learn With Rinkesh — shared formula metadata
// Used by formula-example.html (reference cards) and
// practice.html (explain popup + practice questions).
// =========================================================

const CATEGORY_ICONS = { Lookup: '🔍', Math: '➕', Logic: '⚡' };

const FORMULA_META = [
  {
    id: 'vlookup', name: 'VLOOKUP', category: 'Lookup',
    syntax: '=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])',
    description: "Looks up a value in the first column of a range and returns a value from another column, same row.",
    params: [['lookup_value','Value to search for'],['table_array','Range containing the data'],['col_index_num','Column to pull the result from'],['range_lookup','FALSE for exact match']],
    useCase: "Pulling an employee's salary into another sheet using their ID."
  },
  {
    id: 'sum', name: 'SUM', category: 'Math',
    syntax: '=SUM(number1, [number2], ...)',
    description: "Adds up all the numbers in a range — the most-used formula in Excel.",
    params: [['number1','A number or range to add'],['number2, ...','More numbers or ranges (optional)']],
    useCase: "Totaling four quarters of sales into an annual figure."
  },
  {
    id: 'if', name: 'IF', category: 'Logic',
    syntax: '=IF(logical_test, value_if_true, value_if_false)',
    description: "Returns one value if a condition is true, another if false.",
    params: [['logical_test','The condition to check, e.g. B2>=40'],['value_if_true','Result if true'],['value_if_false','Result if false']],
    useCase: "Flagging an employee as Pass or Fail based on a score cutoff."
  },
  {
    id: 'countif', name: 'COUNTIF', category: 'Math',
    syntax: '=COUNTIF(range, criteria)',
    description: "Counts how many cells in a range match a condition.",
    params: [['range','Cells to check'],['criteria','Condition to match, e.g. "Finance"']],
    useCase: "Counting how many employees belong to one department."
  }
];
