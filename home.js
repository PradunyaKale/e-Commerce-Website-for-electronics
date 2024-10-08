import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { parse } from "date-fns";

const port = 3000;
const app = express();
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Ecommerce",
  password: "P123",
  port: 5432,
});

db.connect();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  const i = await db.query("select * from ID");
  const id = i.rows[0].id;

  const reg = await db.query("select * from login where id=($1)", [id]);
  if (reg.rows.length > 0) {
    if (reg.rows[0].logged_in === true) {
      const ID = await db.query("select * from id");
      const num_of_id = ID.rows[0].id;

      const num = await db.query("select * from cart where user_id=($1)", [
        num_of_id,
      ]);
      let no = num.rows.length;
      const result = await db.query(
        "SELECT SUM(price) AS total FROM cart where user_id=($1)",
        [num_of_id]
      );
      const Total = result.rows[0].total;
      res.render("home.ejs", {
        pro_log: "/profile",
        number: no,
        total: Total,
      });
    } else {
      res.render("home.ejs", { pro_log: "/login" });
    }
  } else {
    res.render("home.ejs", { pro_log: "/login" });
  }
});

app.get("/mobile", (req, res) => {
  res.render("mobile.ejs");
});

app.get("/login", (req, res) => {
  res.render("Login.ejs");
});

app.get("/register", (req, res) => {
  res.render("Register.ejs");
});

app.get("/profile", async (req, res) => {
  const i = await db.query("select * from ID");
  const id = i.rows[0].id;

  const pro_not = await db.query("select * from profile where id=($1)", [id]);

  if (pro_not.rows.length === 1) {
    res.render("Profile.ejs", {
      fname: pro_not.rows[0].fname,
      lname: pro_not.rows[0].lname,
      email: pro_not.rows[0].email,
      phone: pro_not.rows[0].phone,
      address: pro_not.rows[0].address,
    });
  } else {
    res.render("Profile.ejs", {
      fname: "",
      lname: "",
      email: "",
      phone: "",
      address: "",
    });
  }
});

app.post("/register", async (req, res) => {
  const name = req.body.username;
  const pass = req.body.password;
  const con_pass = req.body.confirmPassword;

  if (pass === con_pass) {
    try {
      await db.query("insert into login (username, password) values ($1, $2)", [
        name,
        pass,
      ]);
      res.redirect("/login");
    } catch (error) {
      console.error("Username already registered!");
    }
  } else {
    console.log("Passwords are not matching!");
  }
});

app.post("/login", async (req, res) => {
  const user = req.body.username;
  const pass = req.body.password;

  try {
    const user_registered = await db.query(
      "select * from login where username=($1)",
      [user]
    );
    if (user_registered.rows.length > 0) {
      const result = await db.query(
        "select * from login where username=($1) and password=($2)",
        [user, pass]
      );
      if (result.rows.length > 0) {
        console.log("Login successful!");
        await db.query("update login set logged_in='t' where username=($1)", [
          user,
        ]);

        const id = result.rows[0].id;

        await db.query("update ID set id=($1) where id=0", [id]);

        const profileCheck = await db.query(
          "SELECT * FROM profile WHERE id = ($1)",
          [id]
        );

        if (profileCheck.rows.length === 0) {
          res.redirect("/profile");
        } else {
          const ID = await db.query("select * from id");
          const num_of_id = ID.rows[0].id;

          const num = await db.query("select * from cart where user_id=($1)", [
            num_of_id,
          ]);
          let no = num.rows.length;
          const result = await db.query(
            "SELECT SUM(price) AS total FROM cart where user_id=($1)",
            [num_of_id]
          );
          const Total = result.rows[0].total;
          res.render("home.ejs", {
            pro_log: "/profile",
            number: no,
            total: Total,
          });
        }
      } else {
        console.log("Password incorrect!");
      }
    } else {
      console.log("Username is not registered or incorrect!");
    }
  } catch (error) {
    console.error("Error executing login query:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/profile", async (req, res) => {
  const fname = req.body.fName;
  const lname = req.body.lName;
  const email = req.body.email;
  const phone = req.body.phone;
  const add = req.body.address;

  try {
    const i = await db.query("select * from ID");
    const id = i.rows[0].id;
    const savedProfile = await db.query("select * from profile where id=($1)", [
      id,
    ]);

    if (savedProfile.rows.length === 1) {
      await db.query(
        "update profile set fname=($1), lname=($2), email=($3), phone=($4), address=($5) where id=($6)",
        [fname, lname, email, phone, add, id]
      );
    } else {
      await db.query(
        "insert into profile (fname, lname, email, phone, address) values ($1, $2, $3, $4, $5)",
        [fname, lname, email, phone, add]
      );
    }

    res.render("Profile.ejs", {
      fname: fname,
      lname: lname,
      email: email,
      phone: phone,
      address: add,
    });
  } catch (error) {
    console.error("Error inserting profile data:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/logout", async (req, res) => {
  const i = await db.query("select * from ID");
  const id = i.rows[0].id;

  await db.query("update login set logged_in='f' where id=($1)", [id]);
  await db.query("update ID set id=0 where id=($1)", [id]);
  res.render("home.ejs", { pro_log: "/login" });
});

app.post("/back_home", async (req, res) => {
  const i = await db.query("select * from ID");
  const id = i.rows[0].id;

  await db.query("update login set logged_in='t' where id=($1)", [id]);
  const ID = await db.query("select * from id");
  const num_of_id = ID.rows[0].id;

  const num = await db.query("select * from cart where user_id=($1)", [
    num_of_id,
  ]);
  let no = num.rows.length;
  const result = await db.query(
    "SELECT SUM(price) AS total FROM cart where user_id=($1)",
    [num_of_id]
  );
  const Total = result.rows[0].total;
  res.render("home.ejs", {
    pro_log: "/profile",
    number: no,
    total: Total,
  });
});

app.get("/checkout_form", (req, res) => {
  res.render("Checkout_Form.ejs");
});

app.get("/checkout", (req, res) => {
  res.render("Checkout.ejs");
});

app.post("/mobile", async (req, res) => {
  try {
    const result = await db.query("select * from login where logged_in = true");

    if (result.rows.length > 0) {
      res.render("mobile.ejs");
      const for_id = await db.query("select * from id");
      const user_id = for_id.rows[0].id;
      const item_id = req.body.choice;

      const for_item = await db.query(
        "select * from items where item_id=($1)",
        [item_id]
      );
      const name = for_item.rows[0].name;
      const rating = for_item.rows[0].rating;
      const price = for_item.rows[0].price;
      const image = for_item.rows[0].image;
      await db.query("insert into cart values ($1, $2, $3, $4, $5, $6)", [
        user_id,
        item_id,
        name,
        rating,
        price,
        image,
      ]);
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error checking logged-in status:", error);
    res.status(500).send("Internal Server Error");
  }
});

// app.post("/cart", async(req, res)=>{
//   // try {
//   //   const result = await db.query("select * from login where logged_in = true");
//   //   if (result.rows.length > 0) {
//   //     res.render("cart.ejs");
//   //   } else {
//   //     res.redirect("/login");
//   //   }
//   // } catch (error) {
//   //   console.error("Error checking logged-in status:", error);
//   //   res.status(500).send("Internal Server Error");
//   // }
//   res.render("cart.ejs");
// });

app.get("/cart", async (req, res) => {
  try {
    const result = await db.query("select * from login where logged_in = true");

    if (result.rows.length > 0) {
      const for_id = await db.query("select * from id");
      const user_id = for_id.rows[0].id;
      const items = await db.query("select * from cart where user_id=($1)", [
        user_id,
      ]);
      if (items.rows.length > 0) {
        res.render("Cart.ejs", { items: items.rows });
      } else {
        res.render("Cart.ejs");
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error fetching items from database:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/delete_item", async (req, res) => {
  const item = req.body.choice;
  await db.query("delete from cart where item_id=($1)", [item]);
  res.redirect("/cart");
});

app.post("/details", async (req, res) => {
  try {
    const item = req.body.detail;
    const result = await db.query("select * from details where item_id=($1)", [
      item,
    ]);

    const img = result.rows[0].image;
    const name = result.rows[0].name;
    const price = result.rows[0].price;
    const disc = result.rows[0].disc;
    const brand = result.rows[0].brand;
    const model = result.rows[0].model;
    const os = result.rows[0].operating;
    const cell = result.rows[0].cellular;
    const add = result.rows[0].addt;
    res.render("Page.ejs", {
      image: img,
      name: name,
      price: price,
      disc: disc,
      brand: brand,
      model: model,
      os: os,
      cell: cell,
      add: add,
    });
  } catch (err) {
    console.log("Error: ", err);
  }
});

app.get("/payment", async (req, res) => {
  try {
    const id = await db.query("select * from id");
    const user = id.rows[0].id;

    const reg = await db.query("select * from checkout where id=($1)", [user]);

    const cart = await db.query("select name from cart where user_id=($1)", [user]);
    const items = cart.rows;

    const result = await db.query(
      "SELECT SUM(price) AS total FROM cart where user_id=($1)",
      [user]
    );
    const Total = result.rows[0].total;

    if (reg.rows.length > 0) {
      const add = reg.rows[0];

      const fname = add.fname;
      const lname = add.lname;
      const address = add.houseno;
      const apart = add.apart;
      const city = add.town;
      const state = add.state;
      const zip = add.zip;
      const phone = add.phone;
      const email = add.email;
      res.render("Checkout.ejs", {
        fname: fname,
        lname: lname,
        address: address,
        apart: apart,
        city: city,
        state: state,
        zip: zip,
        phone: phone,
        email: email,
        items: items,
        total: Total
      });
    } else {
      res.render("Checkout.ejs", {items: items, total: Total});
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/address", async (req, res) => {
  const fname = req.body.firstName;
  const lname = req.body.lastName;
  const address = req.body.address;
  const apart = req.body.apartment;
  const city = req.body.city;
  const state = req.body.state;
  const zip = req.body.zipCode;
  const phone = req.body.phone;
  const email = req.body.email;

  try {
    const id = await db.query("select * from id");
    const user = id.rows[0].id;

    const reg = await db.query("select * from checkout where id=($1)", [user]);

    if (reg.rows.length > 0) {
      await db.query(
        "update checkout set fname=($1), lname=($2), houseno=($3), apart=($4), town=($5), state=($6), zip=($7), phone=($8), email=($9) where id=($10)",
        [fname, lname, address, apart, city, state, zip, phone, email, user]
      );
      res.redirect("/payment");
    } else {
      await db.query(
        "insert into checkout values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
        [user, fname, lname, address, apart, city, state, zip, phone, email]
      );
      res.redirect("/payment");
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/order", (req, res)=>{
  res.render("Last.ejs");
});

app.listen(port, () => {
  console.log("Server created at 3000 port");
});