export const validateSchedule = (schedule: any) => {
  try {
    const parsed = JSON.parse(schedule);

    if (!Array.isArray(parsed)) {
      return { valid: false, message: 'Schedule must be an array' };
    }

    if (parsed.length > 6) {
      return { valid: false, message: 'Schedule cannot exceed 6 classes' };
    }

    const hasAtLeastOne = parsed.some(
      (item) => typeof item === 'string' && item.trim().length > 0
    );

    if (!hasAtLeastOne) {
      return { valid: false, message: 'At least one class schedule is required' };
    }

    return { valid: true };
  } catch {
    return { valid: false, message: 'Invalid schedule format' };
  }
};
