import { IMeta } from './opt8';

export class FilterValueConverter {
  toView(options: IMeta[], filterText: string) {
    if (!options)
    {
      return options;
    }
    else if (!filterText) {
      options.forEach(o => o.matching = true);
      return options;
    }
    return options.filter(o => {
      var visible = (o.option.indexOf(filterText) !== -1);
      o.matching = visible;
      return visible;
    });
  }
}
