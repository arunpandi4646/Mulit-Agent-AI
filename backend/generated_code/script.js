document.addEventListener('DOMContentLoaded', function() {
  const helloWorldElement = document.getElementById('hello-world');
  helloWorldElement.textContent = 'Hello, World!';
});

Note: The above code files are designed to work together as a complete system. The `helloWorld.js` file contains the JavaScript code to print "Hello, World!" to the console, while the `index.html` and `script.js` files work together to display "Hello, World!" on a web page. The `styles.css` file provides basic styling for the web page. The `package.json` file manages dependencies and provides a script to run the `helloWorld.js` file using Node.js. 

To run the project, navigate to the root directory and execute the command `npm start` or `node src/helloWorld.js` to print "Hello, World!" to the console. To display "Hello, World!" on a web page, open the `index.html` file in a web browser.