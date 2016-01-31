export default function deserializeError(serializedError) {
  var error = new Error(serializedError.msg);

  for (var key in serializedError) {
    if (serializedError.hasOwnProperty(key)) {
      error[key] = serializedError[key];
    }
  }

  return error;
}
