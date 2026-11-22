const mongoose = require("mongoose");
// If user didn't enter password
if (process.argv.length < 3) {
  // reminder user to enter password
  console.log("Password required");
  //   Exit with status code of 1 indicating failure
  return process.exit(1);
}
console.log("Argument vector values:", process.argv);
const ONLY_PWORD_PROVIDED = process.argv.length === 3;
// retrieve the password, name, and the phone number.
const [, , password, personName, personNumber] = process.argv;
// embed the password to the database url
const url = `mongodb+srv://fullstack:${password}@cluster0.ebbqfog.mongodb.net/phonebookApp`;
mongoose.set("strictQuery", false);
// connect to the database by passing the url, along with the ip version. Mongodb only supports ipv4
mongoose.connect(url, { family: 4 });
// Define the schema of the data.
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});
// Define the name of the model
const Person = mongoose.model("Person", personSchema);
if (ONLY_PWORD_PROVIDED) {
  // Retrieving persons from the database
  console.log("phonebook");
  return Person.find({}).then((result) => {
    result.forEach((person) => console.log(person));
    mongoose.connection.close();
  });
}
// Creating person data
const person = new Person({
  name: personName,
  number: personNumber,
});
// Adding person to the database
person.save().then(({ name, number }) => {
  console.log(`Added ${name} and number ${number} to phonebook`);
  mongoose.connection.close();
});
