// Basic Express server for contacts-book
const express = require("express");
const {
  ContactModel,
  Pager,
  sortContacts,
  filterContacts,
} = require("@jworkman-fs/asl");

const app = express();
const PORT = process.env.PORT || 8080;
app.use(express.json());

// GET /v1/contacts - list all contacts with filtering, sorting, pagination
app.get("/v1/contacts", (req, res) => {
  let result = ContactModel.index().map((c) => ({
    id: c.id ?? null,
    fname: c.fname ?? c.firstName ?? "",
    lname: c.lname ?? c.lastName ?? "",
    email: c.email ?? "",
    phone: c.phone ?? "",
    birthday: c.birthday ?? "",
  }));
  try {
    // Filtering (must use headers, not query params)
    const validFields = ["fname", "lname", "email", "birthday"];
    const validOps = ["eq", "gt", "gte", "lt", "lte"];
    if (
      req.get("X-Filter-By") &&
      req.get("X-Filter-Operator") &&
      req.get("X-Filter-Value")
    ) {
      try {
        const by = req.get("X-Filter-By");
        const op = req.get("X-Filter-Operator");
        result = filterContacts(
          req.get("X-Filter-By"),
          req.get("X-Filter-Operator"),
          req.get("X-Filter-Value"),
          result
        );
      } catch (e) {
        console.error("Filter error:", e);
        return res.status(400).json({ message: e.message });
      }
    }
    // Sorting
    if (req.query.sort) {
      try {
        const sortBy = req.query.sort;
        result = sortContacts(
          [...result],
          req.query.sort,
          req.query.direction || "asc"
        );
      } catch (e) {
        console.error("Sort error:", e);
        return res.status(400).json({ message: e.message });
      }
    }
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const pager = new Pager([...result], page, limit);
    res.set("X-Page-Total", String(pager.total));

    // Call the functions to get the actual page numbers
    const nextPage = pager.next();
    const prevPage = pager.prev();

    if (nextPage && typeof nextPage === "number") {
      res.set("X-Page-Next", String(nextPage));
    }
    if (prevPage && typeof prevPage === "number") {
      res.set("X-Page-Prev", String(prevPage));
    }
    res.type("application/json");
    const pagedResults = pager.results();
    // Always return an array, even if empty
    if (!Array.isArray(pagedResults)) {
      console.error("Paged results not array:", pagedResults);
      return res.status(200).json([]);
    }
    res.status(200).json(pagedResults);
  } catch (e) {
    console.error("General error:", e);
    return res.status(500).json({ message: e.message });
  }
});

// GET /v1/contacts/:id - get a single contact
app.get("/v1/contacts/:id", (req, res) => {
  try {
    const contact = ContactModel.show(req.params.id);
    res.json(contact);
  } catch (e) {
    switch (e.name) {
      case "ContactNotFoundError":
        return res.status(404).json({ message: e.message });
      default:
        return res.status(500).json({ message: e.message });
    }
  }
});

// POST /v1/contacts - add a new contact
app.post("/v1/contacts", (req, res) => {
  try {
    const newContact = ContactModel.create(req.body);
    res.status(303).location(`/v1/contacts/${newContact.id}`).json(newContact);
  } catch (e) {
    switch (e.name) {
      case "DuplicateContactError":
      case "InvalidContactSchemaError":
      case "InvalidContactFieldError":
        return res.status(400).json({ message: e.message });
      default:
        return res.status(500).json({ message: e.message });
    }
  }
});

// PUT /v1/contacts/:id - update a contact
app.put("/v1/contacts/:id", (req, res) => {
  try {
    const updatedContact = ContactModel.update(req.params.id, req.body);
    res.status(303).redirect(`/v1/contacts/${req.params.id}`);
  } catch (e) {
    switch (e.name) {
      case "InvalidContactSchemaError":
      case "InvalidContactFieldError":
        return res.status(400).json({ message: e.message });
      case "ContactNotFoundError":
        return res.status(404).json({ message: e.message });
      default:
        return res.status(500).json({ message: e.message });
    }
  }
});

// DELETE /v1/contacts/:id - delete a contact
app.delete("/v1/contacts/:id", (req, res) => {
  try {
    ContactModel.remove(req.params.id);
    res.status(204).send();
  } catch (e) {
    switch (e.name) {
      case "ContactNotFoundError":
        return res.status(404).json({ message: e.message });
      default:
        return res.status(500).json({ message: e.message });
    }
  }
});

app.get("/", (req, res) => {
  res.send("Contacts Book API is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
