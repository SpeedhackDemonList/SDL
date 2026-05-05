const scale = 3;
const totalMaxPoints = 5632.5; // correspond au total du 1er système

function rawScore(x) {
    if (x > 150 || x < 1) return 0;

    if (x > 55) {
        return 1.039035131 * (185.7 * Math.exp(-0.02715 * x) + 14.84);
    } else if (x > 35) {
        return 1.0371139743 * (212.61 * Math.pow(1.036, 1 - x) + 25.071);
    } else if (x > 20) {
        return ((250 - 83.389) * Math.pow(1.0099685, 2 - x) - 31.152) * 1.0371139743;
    } else if (x > 3) {
        return (326.1 * Math.exp(-0.0871 * x) + 51.09) * 1.037117142;
    } else {
        return -18.2899079915 * x + 368.2899079915;
    }
}

// Calcule une seule fois la somme pondérale
const totalWeight = (() => {
    let sum = 0;
    for (let i = 1; i <= 150; i++) {
        sum += rawScore(i);
    }
    return sum;
})();

/**
 * Score normalisé (comme le système original)
 * @param {number} rank - Position dans la liste (1 = meilleur)
 * @param {number} percent - Pourcentage de complétion
 * @param {number} minPercent - Seuil pour obtenir le score complet
 * @returns {number}
 */
export function score(rank, percent, minPercent) {
    if (rank > 150 || rank < 1) return 0;

    const weight = rawScore(rank);
    const normalized = (weight / totalWeight) * totalMaxPoints;

    let finalScore;
    if (percent < 100) {
        finalScore = normalized * 0.66 * (percent / 100);
    } else {
        finalScore = normalized * ((percent - (minPercent - 1)) / (100 - (minPercent - 1)));
    }

    return round(Math.max(0, finalScore));
}

export function round(num) {
    if (!('' + num).includes('e')) {
        return +(Math.round(num + 'e+' + scale) + 'e-' + scale);
    } else {
        const arr = ('' + num).split('e');
        const sig = +arr[1] + scale > 0 ? '+' : '';
        return +(
            Math.round(+arr[0] + 'e' + sig + (+arr[1] + scale)) +
            'e-' +
            scale
        );
    }
}
