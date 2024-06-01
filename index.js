document.addEventListener("DOMContentLoaded", function () {
    const itemsPerPage = 6; // Her sayfada kaç eleman olacağını belirleyin
    let currentPage = 1; // Başlangıçta ilk sayfayı ayarlayın

    fetch("https://api.github.com/users/FerhatAkalan/repos")
        .then(response => response.json())
        .then(data => {
            // Sadece FerhatAkalan ve FerhatAkalan.github.io repolarını filtrele
            const filteredRepos = data.filter(repo => 
                !repo.name.includes("FerhatAkalan") && !repo.name.includes("FerhatAkalan.github.io")
            );

            // Her bir repo için son commit tarihini al
            const promises = filteredRepos.map(repo => {
                return fetch(`https://api.github.com/repos/FerhatAkalan/${repo.name}/commits?per_page=1`)
                        .then(response => response.json())
                        .then(commits => {
                            if (commits.length > 0) {
                                repo.last_commit_date = commits[0].commit.author.date;
                            } else {
                                repo.last_commit_date = repo.created_at; // Son commit yoksa repo oluşturulma tarihi olarak kabul et
                            }
                            return repo;
                        });
            });

            // Tüm isteklerin tamamlanmasını bekleyerek devam et
            Promise.all(promises).then(repos => {
                // Repoları son commit tarihine göre sırala
                repos.sort((a, b) => new Date(b.last_commit_date) - new Date(a.last_commit_date));

                const portfolioGrid = document.querySelector(".portfolio-grid");

                // Sayfalama işlemini gerçekleştir
                function paginate(page) {
                    portfolioGrid.innerHTML = ''; // Grid'i temizle
                    const startIndex = (page - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const currentRepos = repos.slice(startIndex, endIndex);

                    currentRepos.forEach(repo => {
                        const portfolioItem = document.createElement("div");
                        portfolioItem.classList.add("portfolio-item", "col-md-3");
                        portfolioItem.style.cursor = "pointer"; // Cursor'ı işaretçi yap

                        const img = document.createElement("img");
                        img.src = `./images/19198663.jpg`;
                        img.alt = repo.name;
                        
                        const h3 = document.createElement("h3");
                        h3.textContent = repo.name;

                        const p = document.createElement("p");
                        p.textContent = repo.description || "No description provided.";

                        // Her portfolioItem'a bir tıklama olayı ekle
                        portfolioItem.addEventListener("click", function() {
                            window.open(repo.html_url, "_blank"); // Projeye tıklandığında GitHub proje sayfasını yeni sekmede aç
                        });

                        portfolioItem.appendChild(img);
                        portfolioItem.appendChild(h3);
                        portfolioItem.appendChild(p);

                        portfolioGrid.appendChild(portfolioItem);
                    });

                    // Sayfalama düğmelerini güncelle
                    updatePagination(page);
                }

                // İlk sayfayı göster
                paginate(currentPage);

                // Sayfalama düğmelerini oluştur ve güncelle
                function updatePagination(currentPage) {
                    const paginationContainer = document.querySelector(".pagination-container");
                    paginationContainer.innerHTML = '';

                    const pageCount = Math.ceil(repos.length / itemsPerPage);
                    for (let i = 1; i <= pageCount; i++) {
                        const button = document.createElement("button");
                        button.textContent = i;
                        button.classList.add("btn", "btn-sm", "btn-outline-primary", "mx-1");
                        if (i === currentPage) {
                            button.classList.add("active");
                        }
                        button.addEventListener("click", function() {
                            currentPage = i;
                            paginate(currentPage);
                        });
                        paginationContainer.appendChild(button);
                    }
                }
            });
        })
        .catch(error => console.error("Error fetching GitHub repos:", error));
});
