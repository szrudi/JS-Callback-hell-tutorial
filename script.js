/*
Background articles:
  https://www.freecodecamp.org/news/how-to-deal-with-nested-callbacks-and-avoid-callback-hell-1bc8dc4a2012/
  https://blog.hellojs.org/asynchronous-javascript-from-callback-hell-to-async-and-await-9b9ceb63c8e8
  http://callbackhell.com/
*/

/*
The task:
  printText "The bomb goes off in..."
  wait 1s
  print "3..."
  wait 1s
  print "2..."
  wait 1s
  print "1..."
  wait 1s
  print "Boom!"

Use ony printText() and clear() from common.js for DOM manipulation
*/
deployBombs();

function deployBombs() {
    let delay = 0;
    firstBomb(delay);
    delay += 1;
    secondBomb(delay);
    delay += 5;
    thirdBomb(delay);
    delay += 5;
    fourthBomb(delay);
    delay += 5;
    fifthBomb(delay);
    delay += 5;
    sixthBomb(delay);

    console.log('All bombs deployed.')
}

/*
First step, let's see it without the 1 sec waits
That is easy, we just add the strings in the
textarea with the printText()
*/
function firstBomb(initialWait) {
    clear();
    printText('The 1st bomb goes off in...');
    printText('3...');
    printText('2...');
    printText('1...');
    printText('Boom!');
    console.log('The 1st bomb exploded.');
}

/*
Let's add the 1 sec delay, what can we use for this?
The setTimeout() allows us to run a function after 
a given time (in milliseconds) has elapsed.
*/
function secondBomb(initialWait) {
    setTimeout(() => {
        clear();
        // We wait for a while and start the 2nd bomb
        printText('The 2nd bomb goes off in...');
        setTimeout(() => {
            printText('3...');
            setTimeout(() => {
                printText('2...');
                // How much do we wait here? Was it easy to find out? :)
                setTimeout(() => {
                    printText('1...');
                    setTimeout(() => {
                        // We are far in the "Callback Hell" by now :)
                        // Another name for it is "Pyramid of doom",
                        // we're on the top of that!
                        printText('Boom!');
                        console.log('The 2nd bomb exploded.');
                    }, 1000);
                }, 1000);
            }, 1000);
        }, 1000);
    }, initialWait * 1000);
}

/*
Okay, that Pyramid of doom is really hard to follow, we should refactor
it to make it readable. A simple solution is defining functions. 
*/
function thirdBomb(initialWait) {
    // The first parameter is the initBomb function,
    // that will be called after 1 sec 
    setTimeout(initBomb, initialWait * 1000);

    // It is now really easy to see what one step is exactly
    function initBomb() {
        clear();
        printText('The 3rd bomb goes off in...');
        setTimeout(threeSecLeft, 1000);
    }

    // A step prints the appropriate text
    // and after 1 sec calls the next step that
    // we gave in the setTimeout() argument
    function threeSecLeft() {
        printText('3...');
        setTimeout(twoSecLeft, 1000);
    }

    function twoSecLeft() {
        printText('2...');
        setTimeout(oneSecLeft, 1000);
    }

    function oneSecLeft() {
        printText('1...');
        setTimeout(boom, 1000);
    }

    function boom() {
        printText('Boom!');
        console.log('The 3rd bomb exploded.');
    }
}

/*
Hardcoding the function call order works, but what if I want
to change that? If I want to count up (1, 2, 3, boom),
I have to change several lines of the code.

So lets store the functions in an Array and call them in that order
*/
function fourthBomb(initialWait) {
    setTimeout(initBomb, initialWait * 1000);

    function initBomb() {
        clear();
        // we define the order with this Array
        let nextSteps = [oneSecLeft, twoSecLeft, threeSecLeft, boom];
        printText('The 4th bomb goes off in...');
        setTimeout(() => {
            // in every step, we remove the first item of the nextSteps
            // Array and store the function in the nextStep variable,
            // so now the nextSteps Array has one less item in it
            let nextStep = nextSteps.shift();
            // we call nextStep() and give it the rest of the functions
            nextStep(nextSteps);
        }, 1000);
    }

    function threeSecLeft(nextSteps) {
        printText('3...');
        let nextStep = nextSteps.shift();
        setTimeout(() => nextStep(nextSteps), 1000);
    }

    function twoSecLeft(nextSteps) {
        printText('2...');
        let nextStep = nextSteps.shift();
        setTimeout(() => nextStep(nextSteps), 1000);
    }

    function oneSecLeft(nextSteps) {
        printText('1...');
        let nextStep = nextSteps.shift();
        setTimeout(() => nextStep(nextSteps), 1000);
    }

    function boom() {
        printText('Boom!');
        console.log('The 4th bomb exploded.');
    }
}

/*
We could simplify this example with a recursive tickBomb() function as well.
In some cases this would be the preferred solution, but in this project
we want to see how to call separate functions after each other.
*/
function fifthBomb(initialWait) {
    setTimeout(initBomb, initialWait * 1000);

    function initBomb() {
        clear();
        printText('The 5th bomb goes off in...');
        setTimeout(() => tickBomb(3), 1000);
    }

    function tickBomb(timeLeft) {
        if (timeLeft <= 0) {
            printText('Boom!');
            console.log('The 5th bomb exploded.');
        } else {
            printText(`${timeLeft}...`);
            setTimeout(() => tickBomb(timeLeft - 1), 1000);
        }
    }
}


/*
Our last solution is probably one of the best ways currently to
handle the situation. Here is JavaScript Promise to the rescue!

More detailed Promise example here: https://repl.it/@szrudi/Promise-to-wake-Neo
 */
function sixthBomb(initialWait) {
    setTimeout(() => {
        // we set the order of the steps here, every function in the
        // .then() is called after the previous lines finished 
        initBomb()
            .then(threeSecLeft)
            .then(twoSecLeft)
            .then(oneSecLeft)
            .then(boom);
    }, initialWait * 1000);


    function initBomb() {
        clear();
        printText('The 6th bomb goes off in...');
        // we are now finished with seting up the bomb, so
        // we return a Promise that is already resolved
        // to be able to use .then()
        return Promise.resolve();
    }

    function threeSecLeft() {
        // we want to print '3...' after 1 second
        // on other projects this promiseToPrintText could be
        // an asynchronous function call like fetch() to get the data
        return promiseToPrintText('3...');
    }

    function twoSecLeft() {
        return promiseToPrintText('2...');
    }

    function oneSecLeft() {
        return promiseToPrintText('1...');
    }

    function boom() {
        // in this case we give a different callback function
        // as we want to write to the console as well 
        return promiseToPrintText('Boom!', (msg) => {
            printText(msg);
            console.log('The 6th bomb exploded.');
        });
    }

    /*
    This function will call the given callbackFunction after 1 sec delay
    with the msg parameter. 
    Default parameter function is printText.
     */
    function promiseToPrintText(msg, callbackFunction = printText) {
        // this new Promise is automatically resolved after 1 sec
        // and the message is added to the textarea
        return new Promise((resolve, reject) => {
            setTimeout(
                () => {
                    callbackFunction(msg);
                    resolve(msg);
                },
                1000);
        });
    }
}
