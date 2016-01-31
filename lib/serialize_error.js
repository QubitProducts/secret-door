export default function serializeError(error) {
  var serializedError = {};

  serializedError.name = error.name;
  serializedError.message = error.message;

  // IE
  serializedError.number = error.number;
  serializedError.description = error.description;

  // Firefox
  serializedError.fileName = error.fileName;
  serializedError.lineNumber = error.lineNumber;

  // Chrome / Firefox / latest IE
  serializedError.stack = error.stack;

  return serializedError;
}
