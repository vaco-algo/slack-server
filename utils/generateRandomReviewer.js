function generateRandomReviewer(peopleArr) {
  const deduplication = new Set(peopleArr);

  const people = [...deduplication];

  const order = people
    .map((person) => ({
      name: person,
      number: Math.ceil(Math.random() * 100),
    }))
    .sort((a, b) => a.number - b.number)
    .map((person) => {
      if (!person.name) {
        return "👻";
      }

      return person.name.length > 4 ? `<@${person.name}>` : person.name;
    });

  return order.join(" => ") + " => " + order[0];
}

module.exports = generateRandomReviewer;
