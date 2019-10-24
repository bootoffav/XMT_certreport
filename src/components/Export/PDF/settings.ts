const tableLayout = {
  basic: {
    hLineWidth: (i: any, node: any) => (i === 0 || i === node.table.body.length) ? 2 : 1,
    vLineWidth: (i: any, node: any) => (i === 0 || i === node.table.widths.length) ? 2 : 1,
  }
};

const fonts = {
  Roboto: {

    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  },
  TimesNewRoman: {
    normal: 'times-new-roman.ttf',
    bold: 'times-new-roman-bold.ttf',
    italics: 'times-new-roman-italic.ttf',
    bolditalics: 'times-new-roman-bolditalic.ttf'
  },
  Icons: {
    normal: 'fontello.ttf'
  }
};

export { tableLayout, fonts };