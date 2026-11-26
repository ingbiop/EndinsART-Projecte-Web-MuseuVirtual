// Validació del formulari de ressenyes — EndinsART

export const validateReview = ({ name, rating, comment }) => {
  const errors = {};

  if (!name || name.trim().length < 2) {
    errors.name = 'El nom ha de tenir almenys 2 caràcters.';
  }

  const r = parseInt(rating, 10);
  if (!r || r < 1 || r > 5) {
    errors.rating = 'Selecciona una valoració entre 1 i 5 estrelles.';
  }

  if (!comment || comment.trim().length < 1) {
    errors.comment = 'El comentari no pot estar buit.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
};
