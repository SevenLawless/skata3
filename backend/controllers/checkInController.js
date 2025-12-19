const CheckIn = require('../models/CheckIn');

const calculateHoursFromTimes = (checkInDate, startTime, endTime) => {
  if (!startTime || !endTime) return null;
  const start = new Date(`${checkInDate}T${startTime}`);
  let end = new Date(`${checkInDate}T${endTime}`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  let diffHours = (end - start) / 3600000;
  if (diffHours <= 0) {
    // Assume crossing midnight
    end = new Date(end);
    end.setDate(end.getDate() + 1);
    diffHours = (end - start) / 3600000;
  }

  return Number(diffHours.toFixed(2));
};

const listCheckIns = async (req, res) => {
  try {
    const entries = await CheckIn.findByUser(req.userId);
    res.json({ entries });
  } catch (error) {
    console.error('List check-ins error:', error);
    res.status(500).json({ error: 'Failed to load check-ins' });
  }
};

const createCheckIn = async (req, res) => {
  try {
    const {
      date,
      start_time: startTime,
      end_time: endTime,
      hours: hoursInput,
      notes
    } = req.body;

    const checkInDate = date || new Date().toISOString().split('T')[0];
    let parsedHours = hoursInput ? parseFloat(hoursInput) : null;
    if (isNaN(parsedHours)) {
      parsedHours = null;
    }

    if (!parsedHours) {
      parsedHours = calculateHoursFromTimes(checkInDate, startTime, endTime);
    }

    if (!parsedHours || parsedHours <= 0) {
      return res.status(400).json({
        error: 'Please provide total hours or both a valid start and end time'
      });
    }

    const trimmedNotes = notes ? notes.toString().trim() : '';
    const entry = await CheckIn.create({
      userId: req.userId,
      checkInDate,
      startTime: startTime || null,
      endTime: endTime || null,
      hours: parsedHours,
      notes: trimmedNotes || null
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error('Create check-in error:', error);
    res.status(500).json({ error: 'Failed to save check-in' });
  }
};

module.exports = {
  listCheckIns,
  createCheckIn
};

