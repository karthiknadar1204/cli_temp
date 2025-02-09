#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { simpleGit } from "simple-git";
import ora from "ora";
import inquirer from "inquirer";
import { execSync } from "child_process";

const program = new Command();

program
  .version("1.0.0")
  .argument("<project-name>", "name of the project")
  .action(async (projectName) => {
    const projectPath = path.join(process.cwd(), projectName);
   
    // Check if the project directory already exists
    if (fs.existsSync(projectPath)) {
      console.error(
        chalk.red(`Error: Directory ${projectName} already exists.`)
      );
      process.exit(1);
    }
   
    // Prompt the user to select the template type
    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "template",
        message: "Which template would you like to use?",
        choices: [
          { name: "TypeScript", value: "ts" },
          { name: "JavaScript", value: "js" },
        ],
        default: "ts",
      },
    ]);
   
    // Determine the repository URL based on the user's selection
    const repoUrl =
      answers.template === "js"
        ? "https://github.com/karthiknadar1204/neon-drizzle-starter-kit-js.git"
        : "https://github.com/karthiknadar1204/neon-drizzle-starter-kit-ts.git";
   
    // Create the project directory
    fs.mkdirSync(projectPath);
   
    // Set up the spinner for visual feedback
    const spinner = ora(
      `Downloading ${
        answers.template === "js" ? "JavaScript" : "TypeScript"
      } template...`
    ).start();
   
    const git = simpleGit();
   
    try {
      // Clone the selected template
      await git.clone(repoUrl, projectPath);
      spinner.succeed(
        `${
          answers.template === "js" ? "JavaScript" : "TypeScript"
        } template downloaded successfully!`
      );
   
      // Navigate into the project directory
      process.chdir(projectPath);
   
      // Install dependencies
      spinner.start("Installing dependencies...");
      execSync("npm install --legacy-peer-deps", { stdio: "inherit" });
      spinner.succeed("Dependencies installed successfully!");
   
      console.log(chalk.green(`Project ${projectName} is ready!`));
      console.log(chalk.green(`cd ${projectName} and run npm run dev`));
    } catch (error) {
      spinner.fail("Failed to set up the project.");
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });
  program.parse(process.argv);