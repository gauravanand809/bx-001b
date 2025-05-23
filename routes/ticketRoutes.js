const express = require('express');
const Ticket = require('../models/Ticket');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new ticket (protected)
router.post('/', protect, async (req, res) => {
  try {
    const ticket = new Ticket(req.body);
    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all tickets
router.get('/', protect, async (req, res) => {
  try {
    const { limit, sort } = req.query;
    const query = Ticket.find().populate('employeeId');

    if (sort) query.sort(sort);
    if (limit) query.limit(parseInt(limit));

    const tickets = await query;
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update admin comment
router.put('/:id/comment', protect, async (req, res) => {
  try {
    const { adminComment } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { adminComment },
      { new: true }
    );

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    res.json({ message: 'Admin comment updated successfully', ticket });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update admin comment' });
  }
});

// Get specific ticket
router.get('/:id', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('employeeId');
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    if (ticket.employeeId) {
      ticket.employeeId = {
        ...ticket.employeeId.toObject(),
        department: ticket.employeeId.dept,
      };
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// Close ticket
router.put('/:id/close', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: 'Closed' },
      { new: true }
    );

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    res.json({ message: 'Ticket closed successfully', ticket });
  } catch (error) {
    res.status(500).json({ error: 'Failed to close ticket' });
  }
});

module.exports = router;
