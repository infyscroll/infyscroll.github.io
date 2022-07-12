/**
 * Index JS (Uncompiled)
 *
 * To compile this script into dist/index.js with all the necessary libraries:
 * 1. install vercel/ncc: npm i -g @vercel/ncc
 * 2. build index.js: ncc build index.js --license licenses.txt
 * @see https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action#commit-tag-and-push-your-action-to-github 
 */
const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

import fetch from 'node-fetch';

(async () => {  
  async function execute(database) {
    let successful = false;
    try {
      const url = core.getInput(database + "-url");
      const response = await fetch(url);
      const json = await response.json();
      const filter = database === "ap" ? json.filter(d => d.data && d.data.url && d.data.nextLink && d.data.pageElement) : json.filter(d => d.data && d.data.url && d.data.action && d.data.append);
      if (filter && filter.length > 0) {
        const text = JSON.stringify(json, null, "  ");
        // This output isn't really needed anymore as we are writing the file inside this script, but just for future reference:
        core.setOutput(database + "-json", text);
        fs.writeFile(core.getInput(database + "-file"), text, function (err) { if (err) { throw err; } });
        successful = true;
      } else {
        throw new Error("Empty JSON Filter!");
      }
    } catch (e) {
      console.log(e);
    }
    core.setOutput(database + "successful", successful);
  }
  await execute("ap");
  await execute("is");
})();
