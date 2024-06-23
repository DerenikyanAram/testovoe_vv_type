interface Character {
    id: number;
    name: string;
    status: string;
    species: string;
    type: string;
    gender: string;
    origin: { name: string; url: string };
    location: { name: string; url: string };
    image: string;
    episodes: string[];
    url: string;
}

interface Episode {
    id: number;
    name: string;
    air_date: string;
    episode: string;
    characters: (Character | string)[];
    url: string;
    created: Date;
}

class XHttpClient {
    public static get(url: string): Promise<any> {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            });
    }
}

export class RickAndMortyAPI {
    private static async fetchAllEpisodes(): Promise<Episode[]> {
        const response = await XHttpClient.get('https://rickandmortyapi.com/api/episode');
        return response.results as Episode[];
    }

    private static async fetchCharacter(url: string): Promise<Character> {
        const response = await XHttpClient.get(url);
        return response as Character;
    }

    public static async getAllEpisodesWithCharacterObject(): Promise<Episode[]> {
        const episodes = await this.fetchAllEpisodes();
        for (const episode of episodes) {
            if (typeof episode.characters[0] === 'string') {
                const characterPromises = (episode.characters as string[]).map((characterUrl: string) => {
                    return this.fetchCharacter(characterUrl);
                });
                const characters = await Promise.all(characterPromises);
                episode.characters = characters;
            }
        }
        return episodes;
    }
}

export async function loadEpisodes(page: number, filters?: { name?: string, status?: string, species?: string, gender?: string }) {
    let url = `https://rickandmortyapi.com/api/character?page=${page}`;
    if (filters) {
        if (filters.name) url += `&name=${filters.name}`;
        if (filters.status) url += `&status=${filters.status}`;
        if (filters.species) url += `&species=${filters.species}`;
        if (filters.gender) url += `&gender=${filters.gender}`;
    }
    const response = await XHttpClient.get(url);
    const container = document.getElementById('characterGrid') as HTMLElement;
    container.innerHTML = '';
    response.results.forEach((character: Character) => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.innerHTML = `
            <img src="${character.image}" alt="${character.name}">
            <div class="character-info">
                <h2>${character.name}</h2>
                <div><span class="status-dot ${character.status.toLowerCase()}"></span><span>${character.status} - ${character.species}</span></div>
                <p>Last known location: ${character.location.name}</p>
                <p>First seen in: ${character.origin.name}</p>
            </div>
        `;
        container.appendChild(card);
    });
    updatePagination(response.info.pages, page);
}

function updatePagination(totalPages: number, currentPage: number) {
    const pagination = document.getElementById('pagination') as HTMLElement;
    pagination.innerHTML = `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Назад</button>
        <span>Page ${currentPage} of ${totalPages}</span>
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Вперед</button>
    `;
}

window.onload = () => loadEpisodes(1);

export function changePage(page: number) {
    const filters = getFilters();
    loadEpisodes(page, filters);
}

export function getFilters() {
    const name = (document.getElementById('searchBox') as HTMLInputElement).value;
    const status = (document.getElementById('statusFilter') as HTMLSelectElement).value;
    const species = (document.getElementById('speciesFilter') as HTMLSelectElement).value;
    const gender = (document.getElementById('genderFilter') as HTMLSelectElement).value;
    return { name, status, species, gender };
}

export function applyFilters() {
    const filters = getFilters();
    loadEpisodes(1, filters);
}

document.getElementById('searchBox')!.addEventListener('input', () => {
    const filters = getFilters();
    loadEpisodes(1, filters);
});
