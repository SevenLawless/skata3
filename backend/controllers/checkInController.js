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

const formatDateString = (date) => date.toISOString().split('T')[0];

const getWeekStart = (date) => {
  const result = new Date(date);
  const day = result.getUTCDay();
  const offset = day === 0 ? 6 : day - 1;
  result.setUTCDate(result.getUTCDate() - offset);
  result.setUTCHours(0, 0, 0, 0);
  return result;
};

const getWeekEnd = (startDate) => {
  const end = new Date(startDate);
  end.setUTCDate(end.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);
  return end;
};

const getMonthStart = (date) => {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
};

const getMonthEnd = (startDate) => {
  const end = new Date(startDate);
  end.setUTCMonth(end.getUTCMonth() + 1);
  end.setUTCDate(0);
  end.setUTCHours(23, 59, 59, 999);
  return end;
};

const buildRange = (period, from, to) => {
  const now = new Date();
  let endDate = to ? new Date(to) : now;
  if (Number.isNaN(endDate.getTime())) {
    throw new Error('Invalid to-date');
  }

  if (period === 'week') {
    const startDate = getWeekStart(endDate);
    endDate = getWeekEnd(startDate);
    return {
      from: formatDateString(startDate),
      to: formatDateString(endDate)
    };
  }

  if (period === 'month') {
    const startDate = getMonthStart(endDate);
    endDate = getMonthEnd(startDate);
    return {
      from: formatDateString(startDate),
      to: formatDateString(endDate)
    };
  }

  if (!from) {
    throw new Error('Custom range requires a start date');
  }
  const startDate = new Date(from);
  if (Number.isNaN(startDate.getTime())) {
    throw new Error('Invalid from-date');
  }
  if (startDate > endDate) {
    throw new Error('From date must be before to date');
  }

  return {
    from: formatDateString(startDate),
    to: formatDateString(endDate)
  };
};

const buildSummaryLabel = (period, range) => {
  if (!range) return 'Recent';
  if (period === 'week') {
    return `Week of ${range.from}`;
  }
  if (period === 'month') {
    return `Month of ${range.from.slice(0, 7)}`;
  }
  return `Custom: ${range.from} → ${range.to}`;
};

const listCheckIns = async (req, res) => {
  try {
    const period = ['week', 'month', 'custom'].includes(req.query.period)
      ? req.query.period
      : 'week';
    const limit = Number(req.query.limit) || 100;
    const range = buildRange(period, req.query.from, req.query.to);

    const entries = await CheckIn.findByUserRange(req.userId, {
      from: range.from,
      to: range.to,
      limit
    });
    const totalHours = await CheckIn.sumHoursByRange(req.userId, {
      from: range.from,
      to: range.to
    });

    res.json({
      entries,
      summary: {
        period,
        label: buildSummaryLabel(period, range),
        from: range.from,
        to: range.to,
        totalHours: Number(totalHours.toFixed(2))
      }
    });
  } catch (error) {
    console.error('List check-ins error:', error.message);
    res.status(400).json({ error: error.message || 'Failed to load check-ins' });
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

