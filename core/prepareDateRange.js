import { size, first, each } from 'lodash';
import { get } from 'prompt-lite';
import { unix } from 'moment';

import { getConfig, dirs as _dirs, setConfig, die } from './util';
var config = getConfig();
var dirs = _dirs();
var log = require(dirs.core + 'log');

var scan = require(dirs.tools + 'dateRangeScanner');

// helper to store the evenutally detected
// daterange.
var setDateRange = function(from, to) {
  config.backtest.daterange = {
    from: unix(from).utc().format(),
    to: unix(to).utc().format(),
  };
  setConfig(config);
}


export default function(done) {
  scan((err, ranges) => {

    if(size(ranges) === 0)
      die('No history found for this market', true);

    if(size(ranges) === 1) {
      var r = first(ranges);
      log.info('Gekko was able to find a single daterange in the locally stored history:');
      log.info('\t', 'from:', unix(r.from).utc().format('YYYY-MM-DD HH:mm:ss'));
      log.info('\t', 'to:', unix(r.to).utc().format('YYYY-MM-DD HH:mm:ss'));

      
      setDateRange(r.from, r.to);
      return done();
    }

    log.info(
      'Gekko detected multiple dateranges in the locally stored history.',
      'Please pick the daterange you are interested in testing:'
    );

    each(ranges, (range, i) => {
      log.info('\t\t', `OPTION ${i + 1}:`);
      log.info('\t', 'from:', unix(range.from).utc().format('YYYY-MM-DD HH:mm:ss'));
      log.info('\t', 'to:', unix(range.to).utc().format('YYYY-MM-DD HH:mm:ss'));
    });

    get({name: 'option'}, (err, result) => {

      var option = parseInt(result.option);
      if(option === NaN)
        die('Not an option..', true);

      var range = ranges[option - 1];

      if(!range)
        die('Not an option..', true);

      setDateRange(range.from, range.to);
      return done();
    });

  });
}
