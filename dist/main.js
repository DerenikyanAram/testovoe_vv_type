var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class XHttpClient {
    static get(url) {
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
    static fetchAllEpisodes() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield XHttpClient.get('https://rickandmortyapi.com/api/episode');
            return response.results;
        });
    }
    static fetchCharacter(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield XHttpClient.get(url);
            return response;
        });
    }
    static getAllEpisodesWithCharacterObject() {
        return __awaiter(this, void 0, void 0, function* () {
            const episodes = yield this.fetchAllEpisodes();
            for (const episode of episodes) {
                if (typeof episode.characters[0] === 'string') {
                    const characterPromises = episode.characters.map((characterUrl) => {
                        return this.fetchCharacter(characterUrl);
                    });
                    const characters = yield Promise.all(characterPromises);
                    episode.characters = characters;
                }
            }
            return episodes;
        });
    }
}
export function loadEpisodes(page, filters) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = `https://rickandmortyapi.com/api/character?page=${page}`;
        if (filters) {
            if (filters.name)
                url += `&name=${filters.name}`;
            if (filters.status)
                url += `&status=${filters.status}`;
            if (filters.species)
                url += `&species=${filters.species}`;
            if (filters.gender)
                url += `&gender=${filters.gender}`;
        }
        const response = yield XHttpClient.get(url);
        const container = document.getElementById('characterGrid');
        container.innerHTML = '';
        response.results.forEach((character) => {
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
            card.onclick = () => showModal(character);
            container.appendChild(card);
        });
        updatePagination(response.info.pages, page);
    });
}
function updatePagination(totalPages, currentPage) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Назад</button>
        <span>Page ${currentPage} of ${totalPages}</span>
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Вперед</button>
    `;
}
window.onload = () => loadEpisodes(1);
export function changePage(page) {
    const filters = getFilters();
    loadEpisodes(page, filters);
}
export function getFilters() {
    const name = document.getElementById('searchBox').value;
    const status = document.getElementById('statusFilter').value;
    const species = document.getElementById('speciesFilter').value;
    const gender = document.getElementById('genderFilter').value;
    return { name, status, species, gender };
}
export function applyFilters() {
    const filters = getFilters();
    loadEpisodes(1, filters);
}
document.getElementById('searchBox').addEventListener('input', () => {
    const filters = getFilters();
    loadEpisodes(1, filters);
});
// Modal handling functions
function showModal(character) {
    const modal = document.getElementById('characterModal');
    const detailDiv = document.getElementById('characterDetail');
    detailDiv.innerHTML = `
        <h2>${character.name}</h2>
        <img src="${character.image}" alt="${character.name}">
        <p>Status: ${character.status}</p>
        <p>Species: ${character.species}</p>
        <p>Gender: ${character.gender}</p>
        <p>Origin: ${character.origin.name}</p>
        <p>Location: ${character.location.name}</p>
    `;
    modal.style.display = 'block';
}
function closeModal() {
    const modal = document.getElementById('characterModal');
    modal.style.display = 'none';
}
