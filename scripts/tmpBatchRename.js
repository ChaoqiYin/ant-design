/**
 * ZombieJ: This file is used for https://github.com/ant-design/ant-design/pull/31496 It's safe to
 * remove after css variables function out
 */

// @import '../../style/themes/index';
// import '../../style/index.less';

const fse = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const components = fse.readdirSync('./components');
const originName = 'index.less';
const replaceName = 'index-default.less';

let count = 0;

components.forEach(dir => {
  const dirPath = path.resolve('components', dir);
  if (!fse.lstatSync(dirPath).isDirectory) {
    return;
  }

  const styleIndxPath = path.resolve(dirPath, 'style', 'index.tsx');
  if (!fse.existsSync(styleIndxPath) || !fse.lstatSync(styleIndxPath).isFile) {
    return;
  }

  const injectLessPath = path.resolve(path.dirname(styleIndxPath), replaceName);

  let content = fse.readFileSync(styleIndxPath, 'utf8');

  console.log(chalk.cyan('Path:'), styleIndxPath);

  // Revert
  if (content.includes(replaceName)) {
    content = content.replace(`./${replaceName}`, `./${originName}`);
    fse.writeFileSync(styleIndxPath, content, 'utf8');
  }
  fse.removeSync(injectLessPath);

  // Replace
  if (content.includes(replaceName)) {
    console.log('  ->', chalk.yellow('Skip'));
  } else {
    // Replace path to proxy one
    content = content.replace(`./${originName}`, `./${replaceName}`);
    fse.writeFileSync(styleIndxPath, content, 'utf8');

    // Create a proxy file
    fse.writeFileSync(
      injectLessPath,
      [
        // Declare variables
        '@root-entry-name: default;',
        // Import origin one
        "@import './index';",
      ].join('\n'),
      'utf8',
    );

    console.log('  ->', chalk.green('Update'));
    count += 1;
  }
});

console.log('Done:', count, 'Updated!');