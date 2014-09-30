define(function () {
  return function DoorError(error) {
    this.error = error;
    for (var key in error) {
      if (error.hasOwnProperty(key)) {
        this.error[key] = error[key];
      }
    }
    this.name = error.name;
    this.message = error.message;

    // IE
    this.number = error.number;
    this.description = error.description;

    // Firefox
    this.fileName = error.fileName;
    this.lineNumber = error.lineNumber;

    // Chrome / Firefox / latest IE
    this.stack = error.stack;
  };
});