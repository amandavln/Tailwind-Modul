class IdeasApp {
    constructor() {
        this.currentPage = 1;
        this.perPage = 10;
        this.sortBy = '-published_at';  // Sort by newest by default
        this.totalPages = 1;
        this.totalItems = 0;
        this.ideas = [];
        this.isLoading = false;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadIdeas();  // Memanggil loadIdeas untuk pertama kali
    }

    async loadIdeas() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoading();

        try {
            const data = await this.fetchLocalIdeas(); // Ambil data dari JSON lokal
            this.ideas = data.data || [];  // Mengambil data dari JSON
            this.totalItems = this.ideas.length;
            this.totalPages = Math.ceil(this.totalItems / this.perPage);

            this.hideLoading();
            this.renderIdeas();  // Menampilkan data pada halaman
            this.renderPagination();  // Menampilkan pagination
            this.updatePaginationInfo();  // Menampilkan info pagination
        } catch (error) {
            console.error('Error loading ideas:', error);
            this.hideLoading();
            this.showError();  // Menampilkan pesan error jika gagal
        } finally {
            this.isLoading = false;
        }
    }

    // Fungsi ini membaca data dari file JSON lokal
    async fetchLocalIdeas() {
        const response = await fetch('ideas.json');
        const data = await response.json();  // Parse JSON
        return data;
    }

    // Fungsi untuk merender ideas
    renderIdeas() {
        const grid = document.getElementById('ideasGrid');
        grid.innerHTML = '';  // Clear the grid first

        if (this.ideas.length === 0) {
            grid.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">No ideas found.</div>';
            return;
        }

        // Render ideas ke dalam grid, hanya menampilkan gambar, judul, dan tanggal
        this.ideas.forEach((idea, index) => {
            const card = document.createElement('div');
            card.className = 'idea-card';
            card.style.animationDelay = `${index * 0.1}s`;  // Menambahkan animasi delay untuk setiap card

            // Ambil hanya informasi gambar, judul, dan tanggal
            const imageUrl = idea.small_image || idea.medium_image || 'default_image.jpg'; // jika tidak ada image, gunakan default
            const publishedDate = new Date(idea.published_at).toLocaleDateString(); // Format tanggal

            card.innerHTML = `
                <img src="${imageUrl}" alt="${idea.title}" class="card-image" />
                <div class="card-content">
                    <p class="card-date">${publishedDate}</p>
                    <h3 class="card-title">${idea.title}</h3>
                </div>
            `;
            grid.appendChild(card);  // Menambahkan card ke grid
        });

        this.lazyLoadImages();  // Mengaktifkan lazy loading gambar
    }

    // Fungsi untuk lazy loading gambar
    lazyLoadImages() {
        const images = document.querySelectorAll('.card-image');
        images.forEach((img) => {
            const imageSrc = img.getAttribute('src');
            img.onload = () => img.classList.add('loaded');
            img.src = imageSrc;
        });
    }

    // Fungsi untuk pagination dan lainnya (misalnya, sorting, update URL) bisa ditambahkan sesuai kebutuhan

    showLoading() {
        document.getElementById('loading').style.display = 'block';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showError() {
        document.getElementById('errorMessage').style.display = 'block';
    }

    updatePaginationInfo() {
        const info = document.getElementById('paginationInfo');
        const from = (this.currentPage - 1) * this.perPage + 1;
        const to = Math.min(this.currentPage * this.perPage, this.totalItems);
        info.textContent = `Showing ${from} - ${to} of ${this.totalItems}`;
    }

    renderPagination() {
        const paginationContainer = document.getElementById('pagination');
        paginationContainer.innerHTML = '';

        const createButton = (label, page, isActive = false) => {
            const button = document.createElement('button');
            button.textContent = label;
            button.dataset.page = page;
            if (isActive) button.classList.add('active');
            button.onclick = () => this.changePage(page);
            return button;
        };

        paginationContainer.appendChild(createButton('«', 1));
        paginationContainer.appendChild(createButton('‹', this.currentPage - 1));
        for (let i = 1; i <= this.totalPages; i++) {
            paginationContainer.appendChild(createButton(i, i, i === this.currentPage));
        }
        paginationContainer.appendChild(createButton('›', this.currentPage + 1));
        paginationContainer.appendChild(createButton('»', this.totalPages));
    }

    changePage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.loadIdeas();
        }
    }

    setupEventListeners() {
        // Listen to pagination, sort, etc.
        document.getElementById('perPage').addEventListener('change', (e) => {
            this.perPage = e.target.value;
            this.loadIdeas();
        });
        document.getElementById('sortBy').addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.loadIdeas();
        });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new IdeasApp();
});
