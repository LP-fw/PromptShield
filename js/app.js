const { createApp } = Vue

createApp({
    data() {
        return {
            vistaAttiva: 'intro',
            vulnerabilita: [],
            grafici: {},

            // CRUD
            mostraForm: false,
            formModifica: false,
            form: {
                id: null,
                nome: '',
                codice_owasp: '',
                categoria: '',
                severita: 'Critica',
                anno_scoperta: 2024,
                modello_colpito: '',
                tecnica: '',
                mitigazione: '',
                descrizione: ''
            }
        }
    },

    watch: {
        vistaAttiva(nuovaVista) {
            if (nuovaVista === 'dashboard') {
                this.$nextTick(() => {
                    this.creaGrafici()
                })
            }
            if (nuovaVista === 'crud') {
                this.mostraForm = false
            }
        },

        vulnerabilita: {
            deep: true,
            handler(nuoviDati) {
                localStorage.setItem('vulnerabilita', JSON.stringify(nuoviDati))
            }
        }
    },

    mounted() {
        this.caricaDati()
    },

    methods: {

        // caricamento dati
        async caricaDati() {
            const saved = localStorage.getItem('vulnerabilita')
            if (saved) {
                this.vulnerabilita = JSON.parse(saved)
            } else {
                const response = await fetch('data/vulnerabilities.json')
                this.vulnerabilita = await response.json()
            }
        },

        // creaz CRUD
        apriFormNuovo() {
            this.formModifica = false
            this.form = {
                id: Date.now(),
                nome: '',
                codice_owasp: '',
                categoria: '',
                severita: 'Critica',
                anno_scoperta: 2024,
                modello_colpito: '',
                tecnica: '',
                mitigazione: '',
                descrizione: ''
            }
            this.mostraForm = true
        },

        salva() {
            if (!this.form.nome.trim() || !this.form.codice_owasp.trim()) {
                alert('Inserisci almeno il Nome e il Codice OWASP.')
                return
            }
            if (this.formModifica) {
                // update
                const index = this.vulnerabilita.findIndex(v => v.id === this.form.id)
                if (index !== -1) {
                    this.vulnerabilita[index] = { ...this.form }
                }
            } else {
                // crea
                this.vulnerabilita.push({ ...this.form })
            }
            this.mostraForm = false
        },

        // update CRUD
        modifica(vuln) {
            this.form = { ...vuln }
            this.formModifica = true
            this.mostraForm = true
        },

        // CRUD delete
        elimina(id) {
            if (confirm('Sei sicura di voler eliminare questa vulnerabilità?')) {
                this.vulnerabilita = this.vulnerabilita.filter(v => v.id !== id)
            }
        },

        // ripristino dati
        async resetDati() {
            if (confirm('Ripristinare i dati originali? Tutte le modifiche andranno perse.')) {
                localStorage.removeItem('vulnerabilita')
                await this.caricaDati()
            }
        },

        annulla() {
            this.mostraForm = false
        },

        // grafici
        creaGrafici() {
            this.creaGraficoSeverita()
            this.creaGraficoCategorie()
            this.creaGraficoAnni()
        },

        creaGraficoSeverita() {
            const canvas = document.getElementById('chartSeverita')
            if (!canvas) return
            if (this.grafici.severita) this.grafici.severita.destroy()

            const conteggio = { 'Critica': 0, 'Alta': 0, 'Media': 0 }
            this.vulnerabilita.forEach(v => {
                if (conteggio[v.severita] !== undefined) conteggio[v.severita]++
            })

            this.grafici.severita = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: Object.keys(conteggio),
                    datasets: [{
                        label: 'Numero vulnerabilità',
                        data: Object.values(conteggio),
                        backgroundColor: [
                            'rgba(248, 81, 73, 0.7)',
                            'rgba(210, 153, 34, 0.7)',
                            'rgba(63, 185, 80, 0.7)'
                        ],
                        borderColor: ['#f85149', '#d29922', '#3fb950'],
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#161b22',
                            borderColor: '#30363d',
                            borderWidth: 1,
                            titleColor: '#e6edf3',
                            bodyColor: '#7d8590'
                        }
                    },
                    scales: {
                        x: { ticks: { color: '#7d8590' }, grid: { color: '#21262d' } },
                        y: { ticks: { color: '#7d8590', stepSize: 1 }, grid: { color: '#21262d' }, beginAtZero: true }
                    }
                }
            })
        },

        creaGraficoCategorie() {
            const canvas = document.getElementById('chartCategorie')
            if (!canvas) return
            if (this.grafici.categorie) this.grafici.categorie.destroy()

            const conteggio = {}
            this.vulnerabilita.forEach(v => {
                conteggio[v.categoria] = (conteggio[v.categoria] || 0) + 1
            })

            this.grafici.categorie = new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(conteggio),
                    datasets: [{
                        data: Object.values(conteggio),
                        backgroundColor: [
                            'rgba(88, 166, 255, 0.7)',
                            'rgba(248, 81, 73, 0.7)',
                            'rgba(63, 185, 80, 0.7)',
                            'rgba(210, 153, 34, 0.7)',
                            'rgba(139, 92, 246, 0.7)',
                            'rgba(236, 72, 153, 0.7)',
                            'rgba(20, 184, 166, 0.7)'
                        ],
                        borderColor: '#161b22',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: '#7d8590', padding: 16, font: { size: 12 } }
                        },
                        tooltip: {
                            backgroundColor: '#161b22',
                            borderColor: '#30363d',
                            borderWidth: 1,
                            titleColor: '#e6edf3',
                            bodyColor: '#7d8590'
                        }
                    }
                }
            })
        },

        creaGraficoAnni() {
            const canvas = document.getElementById('chartAnni')
            if (!canvas) return
            if (this.grafici.anni) this.grafici.anni.destroy()

            const conteggio = {}
            this.vulnerabilita.forEach(v => {
                conteggio[v.anno_scoperta] = (conteggio[v.anno_scoperta] || 0) + 1
            })

            const anniOrdinati = Object.keys(conteggio).sort()

            this.grafici.anni = new Chart(canvas, {
                type: 'line',
                data: {
                    labels: anniOrdinati,
                    datasets: [{
                        label: 'Vulnerabilità scoperte',
                        data: anniOrdinati.map(a => conteggio[a]),
                        borderColor: '#58a6ff',
                        backgroundColor: 'rgba(88, 166, 255, 0.1)',
                        borderWidth: 2,
                        pointBackgroundColor: '#58a6ff',
                        pointRadius: 5,
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#161b22',
                            borderColor: '#30363d',
                            borderWidth: 1,
                            titleColor: '#e6edf3',
                            bodyColor: '#7d8590'
                        }
                    },
                    scales: {
                        x: { ticks: { color: '#7d8590' }, grid: { color: '#21262d' } },
                        y: { ticks: { color: '#7d8590', stepSize: 1 }, grid: { color: '#21262d' }, beginAtZero: true }
                    }
                }
            })
        }
    }

}).mount('#app')