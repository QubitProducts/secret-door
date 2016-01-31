export default function () {
  var id = + new Date();
  while (id === + new Date()) {
    // deliberately empty
  }
  id = + new Date();
  return id;
}
