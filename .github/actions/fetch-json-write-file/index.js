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

  /**
   * Performs the workflow action: downloading the database as JSON and writing it to a file in the repository.
   *
   * @param database the database name (used for the inputs and filtering the database)
   */
  async function action(database) {
    console.log("action() - database=" + database);
    let successful = false;
    try {
      const url = core.getInput(database + "-url");
      const response = await fetch(url);
      const json = await response.json();
      const filter = database === "ap" ? json.filter(d => d.data && d.data.url && d.data.nextLink && d.data.pageElement) : json.filter(d => d.data && d.data.url && d.data.action && d.data.append);
      if (filter && filter.length > 0) {
        const file = core.getInput(database + "-file");
        const text = JSON.stringify(json, null, "  ");
        // This output isn't really needed anymore as we are writing the file inside this script, but just for future reference:
        // core.setOutput(database + "-json", text);
        fs.writeFile(file, text, function (err) { if (err) { throw err; } });
        successful = true;
      } else {
        throw new Error("empty database!");
      }
    } catch (e) {
      console.log(e);
    }
    // This output also isn't needed anymore as we are doing the successful check inside this script when we check that filter.length isn't 0
    core.setOutput(database + "-successful", successful);
    console.log("action() - successful=" + successful);
  }

  // Perform the actions for each database in successive order (await each fetch request just to be safe?)
  await action("ap");
  await action("is");

})();
