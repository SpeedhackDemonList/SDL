import { round, score } from './score.js';

/**
 * GitHub API Configuration
 * Fetches data directly from the SDL-data repository
 */
const GITHUB_USERNAME = 'SpeedhackDemonList';
const GITHUB_REPO = 'SDL';
const GITHUB_BRANCH = 'main';
const GITHUB_DATA_PATH = 'data';

// Direct URL to raw GitHub content
const BASE_URL = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPO}/${GITHUB_BRANCH}/${GITHUB_DATA_PATH}`;

/**
 * Fetch a JSON file directly from GitHub
 */
async function fetchFromGitHub(filename) {
    try {
        const url = `${BASE_URL}/${filename}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error(`Failed to fetch ${filename}: ${response.status}`);
            return null;
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${filename}:`, error);
        return null;
    }
}

export async function fetchList() {
    try {
        // Fetch the _list.json file
        const list = await fetchFromGitHub('_list.json');
        
        if (!list) {
            console.error('Failed to load list.');
            return null;
        }
        
        return await Promise.all(
            list.map(async (path, rank) => {
                try {
                    const level = await fetchFromGitHub(`${path}.json`);
                    
                    if (!level) {
                        return [null, path];
                    }
                    
                    return [
                        {
                            ...level,
                            path,
                            records: level.records.sort(
                                (a, b) => b.percent - a.percent,
                            ),
                        },
                        null,
                    ];
                } catch (error) {
                    console.error(`Failed to load level #${rank + 1} ${path}.`, error);
                    return [null, path];
                }
            }),
        );
    } catch (error) {
        console.error('Failed to load list.', error);
        return null;
    }
}

export async function fetchListNames() {
    try {
        const list = await fetchFromGitHub('_list.json');
        return list;
    } catch (error) {
        console.error('Failed to load list names.', error);
        return null;
    }
}

export async function fetchEditors() {
    try {
        const editors = await fetchFromGitHub('_editors.json');
        return editors;
    } catch (error) {
        console.error('Failed to load editors.', error);
        return null;
    }
}

export async function fetchLeaderboard() {
    const list = await fetchList();
    const scoreMap = {};
    const errs = [];
    
    list.forEach(([level, err], rank) => {
        if (err) {
            errs.push(err);
            return;
        }
        
        // Verification
        const verifier = Object.keys(scoreMap).find(
            (u) => u.toLowerCase() === level.verifier.toLowerCase(),
        ) || level.verifier;
        scoreMap[verifier] ??= {
            verified: [],
            completed: [],
            progressed: [],
        };
        const { verified } = scoreMap[verifier];
        verified.push({
            rank: rank + 1,
            level: level.name,
            score: score(rank + 1, 100, level.percentToQualify),
            link: level.verification,
        });
        
        // Records
        level.records.forEach((record) => {
            const user = Object.keys(scoreMap).find(
                (u) => u.toLowerCase() === record.user.toLowerCase(),
            ) || record.user;
            scoreMap[user] ??= {
                verified: [],
                completed: [],
                progressed: [],
            };
            const { completed, progressed } = scoreMap[user];
            
            if (record.percent === 100) {
                completed.push({
                    rank: rank + 1,
                    level: level.name,
                    score: score(rank + 1, 100, level.percentToQualify),
                    link: record.link,
                });
                return;
            }
            
            progressed.push({
                rank: rank + 1,
                level: level.name,
                percent: record.percent,
                score: score(rank + 1, record.percent, level.percentToQualify),
                link: record.link,
            });
        });
    });
    
    // Wrap in extra Object containing the user and total score
    const res = Object.entries(scoreMap).map(([user, scores]) => {
        const { verified, completed, progressed } = scores;
        const total = [verified, completed, progressed]
            .flat()
            .reduce((prev, cur) => prev + cur.score, 0);
        return {
            user,
            total: round(total),
            ...scores,
        };
    });
    
    // Sort by total score
    return [res.sort((a, b) => b.total - a.total), errs];
}
