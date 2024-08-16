const client = require('ftp');
const fs = require('fs');
const logger = require('./logger.cjs');
const constants = require('./constant.json');

const getFtpDetails = {
  host: '10.126.200.41',
  port: 21,
  user: 'konynodejs',
  password: 'p@ssw0rd',
  secure: false,
  secureOptions: 'none',
  connTimeout: 10000,
  pasvTimeout: 10000,
  aliveTimeout: 10000
}

const ftpdir = () => {
  try {
    var c = new client();
    c.on('ready', () => {
      c.list((err, list) => {
        if (err) {
          logger().error("exception in ftpdir" + err);
        } else {
          logger().info("got dir list ");
          console.dir(list);
          c.end();
        }
      });
    });
    c.connect(getFtpDetails);
  } catch (e) {
    logger().error("Exception in ftp connection" + e);
  }
}

const ftpUpload = (file, fileName) => {
  try {
    var c = new client();
    c.on('ready', () => {
      var rempteFilePath = constants.remoteFilePath;
      c.put(file, rempteFilePath + fileName, (err) => {
        if (err) {
          logger().error("exception in ftpUpload" + err);
        } else {
          logger().info("uploaded to ftp ");
          c.end();
        }
      });
    });
    c.connect(getFtpDetails);
  } catch (e) {
    logger().error("Exception in ftp upload" + e);
  }
}

const ftpDownload = (fileName) => {
  try {
    var c = new client();
    c.on('ready', () => {
      let rempteFilePath = constants.remoteFilePath;
      let dirPath = process.env.USERPROFILE.replace(/\\\\/g, '\/');
      let downloadPath = constants.downloadPath;
      let fielExtension = constants.fielExtension;
      c.get(rempteFilePath + fileName, (err, stream) => {
        if (err) {
          logger().error("exception in ftpDownload" + err);
        } else {
          logger().info("got stream");
          stream.once('close', function () { c.end(); });
          stream.pipe(fs.createWriteStream(`${dirPath + downloadPath}PBK123456789_RECORD${fielExtension}`));
        }
      });
    });
    c.connect(getFtpDetails);
  } catch (e) {
    logger().error("Exception in ftp download" + e);
  }
}

module.exports = { ftpdir, ftpDownload, ftpUpload };