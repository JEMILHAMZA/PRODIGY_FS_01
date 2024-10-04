// routes/events.js

const express = require('express');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const Event = require('../models/Event');
const router = express.Router();

// View all events
router.get('/', ensureAuthenticated, async (req, res) => {
    try {
      const events = await Event.find({});
      res.render('events/index', { events, user: req.user }); // Pass user to the view
    } catch (error) {
      console.log(error);
      res.redirect('/');
    }
  });
  

// Create a new event (Admin only)
router.get('/new', ensureAdmin, (req, res) => {
  res.render('events/new');
});

router.post('/', ensureAdmin, async (req, res) => {
  const { title, description, date } = req.body;
  const newEvent = new Event({
    title,
    description,
    date,
    createdBy: req.user._id,
  });

  try {
    await newEvent.save();
    res.redirect('/events');
  } catch (error) {
    console.log(error);
    res.redirect('/events/new');
  }
});

// Edit an event (Admin only)
router.get('/edit/:id', ensureAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    res.render('events/edit', { event });
  } catch (error) {
    console.log(error);
    res.redirect('/events');
  }
});

router.post('/edit/:id', ensureAdmin, async (req, res) => {
  const { title, description, date } = req.body;

  try {
    await Event.findByIdAndUpdate(req.params.id, {
      title,
      description,
      date,
    });
    res.redirect('/events');
  } catch (error) {
    console.log(error);
    res.redirect(`/events/edit/${req.params.id}`);
  }
});

// Delete an event (Admin only)
router.post('/delete/:id', ensureAdmin, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.redirect('/events');
  } catch (error) {
    console.log(error);
    res.redirect('/events');
  }
});

module.exports = router;
