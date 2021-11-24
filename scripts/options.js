navigator.mediaDevices
  .getUserMedia({ audio: true })
  .then(function (stream) {
    console.log("You let me use your mic!");
  })
  .catch(function (err) {
    console.log("No mic for you!");
  });

var messages = ["Hey", "Hi, there!", "Hi!", "Hello"];

if (annyang) {
  annyang.debug();
  console.log("We have annyang!");

  var commands = {
    Hello: hello,
    "What is your name": myname,
    "new tab": newtab,
    "open tab": newtab,
  };

  function hello() {
    var randomIndex = Math.round(Math.random() * messages.length);
    console.log(
      `%c ${messages[randomIndex]}`,
      "color: green; font-weight:bold;"
    );
  }

  function myname() {
    console.log("My name is Billy!");
  }

  function newtab() {
    window.open("", "_blank");
  }

  // Add Commands
  annyang.addCommands(commands);

  // Start listening
  annyang.start();
}
