
# UCSD AKPsi Rush Website

Website for the UCSD AKPsi's 2024 rush process.

## Setting Up the Project

Follow these instructions to set up the project.

### Step 1: Clone the Repository

1. Open your terminal (Command Prompt, PowerShell, or another terminal).
2. Clone the project repository by running the following command:

   ```
   git clone https://github.com/sdakpsi/RushWebsite
   ```

3. If you get an error indicating that `git` is not recognized, you will need to install Git. Follow the instructions here: [Installing Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).

### Step 2: Install Project Dependencies

1. Navigate into the project folder (it will be named after the repository)
   ```
   cd RushWebsite
   ```
2. Run the following command to install necessary dependencies:

   ```
   npm install
   ```

3. If you encounter issues with `npm` not being recognized, you may need to install Node.js and npm. You can do so here: [Download Node.js](https://nodejs.org/en/download/prebuilt-installer).

### Step 3: Verify Your Git Branch

Before running the project, check which branch you are on by running:

```
git branch
```

You should typically be on the `dev` branch for development work.

### Step 4: Start the Development Server

1. Run the following command to start the development server:

   ```
   npm run dev
   ```

2. Once the server starts, open your browser and go to `http://localhost:3000`. This will allow you to see the website running locally on your machine.

## Working on an Issue

There are two primary branches you should be aware of:

- **main**: This branch holds the version that leads users directly to the interest form before the rush starts.
- **dev**: This branch contains the version of the website used during rush, which includes a link to the interest form and a sign-in option for the application.

### Step 1: Switch to the Correct Branch

When you are ready to work on an issue, switch to the correct branch, likely `dev`. You can do this by running:

```
git checkout dev
```

### Step 2: Create a New Branch

To work on an issue, create a new branch specific to that task. An example is `aj-dev-fixing-colors`

```
git checkout -b <branch-name>
```

This creates a new branch and switches you to it so that you can make changes specific to your issue.

### Step 3: Test Your Changes

1. As you work, you should regularly test the changes. Run:

   ```
   npm run dev
   ```

2. Open `http://localhost:3000` in your browser to make sure everything works as expected.

### Step 4: Commit and Push Changes

Once you’ve finished working on your issue and verified that it works:

1. Stage your changes by running:

   ```
   git add .
   ```

2. Commit your changes with a message describing what you’ve done:

   ```
   git commit -m "<commit-message>"
   ```

3. Push your changes to the repository:

   ```
   git push
   ```

### Step 5: Create a Pull Request

1. Go to the GitHub repository.
2. Navigate to the **Pull Requests** tab and click on **New Pull Request**.
3. Make sure the pull request is set to merge your branch into `dev`, and not `main`. It should look like this: `dev <- <your-branch>`.
4. Add a description of the work you’ve done.
5. Create the pull request.

## That's it!

You have now successfully contributed to the project! 🎉
