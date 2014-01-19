var conf = require('./conf.js'),
		bwd  = require('./lib/bw_daemon.js');

var srv = new bwd(conf).start();
