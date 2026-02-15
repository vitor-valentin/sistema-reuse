let charts = {};

const colors = {
    darkBlue: '#343C6A',
    mainBlue: '#2D60FF',
    green: '#16DBCC',
    red: '#FE5C73',
    darkCyanGrey: '#ACB0C3',
    yellow: '#FFBB38'
};

const commonOptions = {
    chart: { toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'inherit' },
    noData: { text: 'Carregando...', style: { color: colors.darkCyanGrey } }
};

charts.bar = new ApexCharts(document.querySelector("#barChart"), {
    ...commonOptions,
    series: [],
    chart: { ...commonOptions.chart, type: 'bar', height: 250 },
    plotOptions: { bar: { borderRadius: 6, columnWidth: '45%' } },
    colors: [colors.mainBlue],
    xaxis: { categories: [] },
    dataLabels: { enabled: false }
});

charts.line = new ApexCharts(document.querySelector("#lineChart"), {
    ...commonOptions,
    series: [],
    chart: { ...commonOptions.chart, type: 'line', height: 250 },
    stroke: { curve: 'smooth', width: 4 },
    markers: { size: 6, colors: [colors.mainBlue], strokeWidth: 3 },
    colors: [colors.mainBlue],
    grid: { strokeDashArray: 5, borderColor: colors.darkCyanGrey + '33' }
});

charts.donut = new ApexCharts(document.querySelector("#donutChart"), {
    ...commonOptions,
    series: [],
    chart: { ...commonOptions.chart, type: 'donut', height: 300 },
    legend: { position: 'bottom' },
    colors: [colors.mainBlue, colors.green, colors.yellow, colors.red, colors.darkBlue, colors.darkCyanGrey],
    dataLabels: { enabled: false }
});

charts.activity = new ApexCharts(document.querySelector("#activityChart"), {
    ...commonOptions,
    series: [],
    chart: { ...commonOptions.chart, type: 'area', height: 280 },
    colors: [colors.mainBlue],
    fill: { 
        type: 'gradient', 
        gradient: { 
            shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0,
            colorStops: [{ offset: 0, color: colors.mainBlue, opacity: 0.4 }, { offset: 100, color: colors.mainBlue, opacity: 0 }]
        } 
    },
    stroke: { curve: 'smooth', width: 3 },
    xaxis: { categories: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'] }
});

charts.geo = new ApexCharts(document.querySelector("#geoChart"), {
    ...commonOptions,
    series: [],
    chart: { ...commonOptions.chart, type: 'treemap', height: 350 },
    colors: [colors.mainBlue],
    plotOptions: { treemap: { distributed: true, enableShades: true } }
});

charts.funnel = new ApexCharts(document.querySelector("#funnelChart"), {
    ...commonOptions,
    series: [],
    chart: { ...commonOptions.chart, type: 'bar', height: 350 },
    plotOptions: { bar: { horizontal: true, barHeight: '80%', isFunnel: true } },
    colors: [colors.mainBlue, colors.green],
    dataLabels: {
        enabled: true,
        formatter: (val, opt) => `${opt.w.globals.labels[opt.dataPointIndex]}: ${val}`,
        style: { fontFamily: 'inherit' }
    }
});

Object.values(charts).forEach(chart => chart.render());

async function loadDashboardCards() {
    try {
        const response = await fetch('/admin/dashboard/getDashboardCards');
        const data = await response.json();

        const formatNumber = (num) => {
            return num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num;
        };

        const updateCard = (idPrefix, total, acrescimo) => {
            const totalEl = document.getElementById(`${idPrefix}-total`);
            const trendEl = document.getElementById(`${idPrefix}-trend`);
            
            if (!totalEl || !trendEl) return;

            totalEl.innerText = idPrefix === 'mensagens' ? formatNumber(total) : total.toLocaleString('pt-BR');

            if (acrescimo === null || acrescimo === 0) {
                trendEl.className = `text-[10px] font-bold mt-2 text-darkcyangrey`;
                trendEl.innerHTML = `<i class="fa-solid fa-clock-rotate-left"></i> Sem histórico <span class="text-gray-400 font-normal ml-1"></span>`;
                return;
            }

            const isPositive = acrescimo >= 0;
            const icon = isPositive ? 'fa-arrow-up' : 'fa-arrow-down';
            const colorClass = isPositive ? 'text-green' : 'text-red';
            
            trendEl.className = `text-[10px] font-bold mt-2 ${colorClass}`;
            trendEl.innerHTML = `
                <i class="fa-solid ${icon}"></i> 
                ${Math.abs(acrescimo)}% 
                <span class="text-gray-400 font-normal ml-1">vs mês anterior</span>
            `;
        };

        updateCard('empresas', data.empresas.total, data.empresas.acrescimo);
        updateCard('categorias', data.categorias.total, data.categorias.acrescimo);
        updateCard('mensagens', data.mensagens.total, data.mensagens.acrescimo);
        updateCard('anuncios', data.anuncios.total, data.anuncios.acrescimo);

    } catch (error) {
        console.error('Erro ao carregar cards:', error);
    }
}

async function loadRegistrationInfo() {
    try {
        const response = await fetch('/admin/dashboard/getRegistrationInfo');
        const { solicitations, approvals } = await response.json();

        const formatRelativeDate = (dateStr) => {
            if (!dateStr) return "---";
            const now = new Date();
            const date = new Date(dateStr);
            const diffInMs = now - date;
            const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

            if (diffInDays === 0) return "HOJE";
            if (diffInDays === 1) return "ONTEM";
            if (diffInDays < 7) return `Há ${diffInDays} dias`;
            if (diffInDays < 30) {
                const weeks = Math.floor(diffInDays / 7);
                return `Há ${weeks} ${weeks > 1 ? 'semanas' : 'semana'}`;
            }
            if (diffInDays < 365) {
                const months = Math.floor(diffInDays / 30);
                return `Há ${months} ${months > 1 ? 'meses' : 'mês'}`;
            }
            const years = Math.floor(diffInDays / 365);
            return `Há ${years} ${years > 1 ? 'anos' : 'ano'}`;
        };

        const renderList = (containerId, items, isApproval = false) => {
            const container = document.getElementById(containerId);
            if (!container) return;

            if (items.length === 0) {
                container.innerHTML = `<p class="py-4 text-center text-xs text-darkcyangrey">Nenhum registro encontrado.</p>`;
                return;
            }

            container.innerHTML = items.map(item => {
                const name = item.nomeFantasia || item.razaoSocial;
                const initial = name.charAt(0).toUpperCase();
                const dateLabel = formatRelativeDate(isApproval ? item.dataAprovacao : item.dataCadastro);
                
                return `
                <div class="flex justify-between items-center py-3">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-mainblue/15 text-mainblue text-[18px] pt-0.5 rounded-full flex items-center justify-center font-bold">
                            ${initial}
                        </div>
                        <div>
                            <p class="text-sm font-bold text-darkblue">${name}</p>
                            <p class="text-[10px] text-gray-400">${item.cidade}, ${item.estado}</p>
                        </div>
                    </div>
                    <span class="text-[10px] font-bold text-gray-400 uppercase">${dateLabel}</span>
                </div>`;
            }).join('');
        };

        renderList('solicitations-list', solicitations);
        renderList('approvals-list', approvals, true);

    } catch (error) {
        console.error('Erro ao carregar registros:', error);
    }
}

async function loadDashboardCharts() {
    try {
        const response = await fetch('/admin/dashboard/getDashboardCharts');
        const data = await response.json();

        const weeklyData = [];
        const weeklyLabels = [];
        const now = new Date();

        for (let i = 4; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - (i * 7));
            
            const year = d.getFullYear();

            const firstDayOfYear = new Date(year, 0, 1);
            const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
            const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay()) / 7);
            
            const weekKey = `${year}-${weekNum}`; 

            const dbEntry = data.weeklyAnnounced.find(entry => entry.anoSemana === weekKey);
            
            weeklyLabels.push(`Sem ${5 - i}`); 
            weeklyData.push(dbEntry ? Number(dbEntry.totalAnunciado) : 0);
        }

        charts.bar.updateOptions({
            xaxis: { categories: weeklyLabels }
        });
        charts.bar.updateSeries([{ name: 'Itens', data: weeklyData }]);

        const monthsCount = 6;
        const semesterData = [];
        const semesterLabels = [];

        for (let i = monthsCount - 1; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const label = d.toISOString().slice(0, 7);
            
            const dbEntry = data.semesterSold.find(entry => entry.mesAno === label);
            
            semesterLabels.push(label);
            semesterData.push(dbEntry ? Number(dbEntry.totalVendido) : 0);
        }

        charts.line.updateOptions({
            xaxis: { 
                categories: semesterLabels,
                labels: {
                    formatter: (val) => {
                        if (!val || typeof val !== 'string' || !val.includes('-')) {
                            return val;
                        }

                        const parts = val.split('-');
                        const year = parts[0];
                        const month = parts[1];
                        
                        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
                        
                        const monthIndex = parseInt(month) - 1;
                        if (monthIndex < 0 || monthIndex > 11) return val;

                        return `${monthNames[monthIndex]}/${year.slice(2)}`;
                    }
                }
            }
        });

        charts.line.updateSeries([{ 
            name: 'Vendas', 
            data: semesterData 
        }]);

        const categoryLabels = data.anunciosCategory.map(d => d.categoria);
        const categoryData = data.anunciosCategory.map(d => Number(d.totalAtivos));

        const dynamicColors = data.anunciosCategory.map(d => {
            if (d.categoria === 'Outros') return colors.darkCyanGrey;
            const palette = [colors.mainBlue, colors.green, colors.yellow, colors.red, colors.darkBlue];
            return palette[data.anunciosCategory.indexOf(d) % palette.length];
        });

        charts.donut.updateOptions({ 
            labels: categoryLabels,
            colors: dynamicColors,
            plotOptions: {
                pie: {
                    donut: {
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Total Ativo',
                                color: colors.darkBlue,
                                formatter: function (w) {
                                    return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                                }
                            }
                        }
                    }
                }
            }
        });
        charts.donut.updateSeries(categoryData);

        const v = data.weeklyVisualizations[0] || { seg:0, ter:0, qua:0, qui:0, sex:0, sab:0, dom:0 };
        charts.activity.updateSeries([{
            name: 'Visualizações',
            data: [v.seg, v.ter, v.qua, v.qui, v.sex, v.sab, v.dom]
        }]);

        charts.geo.updateSeries([{
            data: data.densityPerState.map(d => ({ x: d.estado, y: d.totalAnuncios }))
        }]);

        const funnelOrder = ['Visualizações', 'Interesses (Chat)'];
        const funnelSeries = funnelOrder.map(label => {
            const item = data.visByInteractions.find(i => i.etapa === label);
            return item ? item.quantidade : 0;
        });
        charts.funnel.updateOptions({ xaxis: { categories: funnelOrder } });
        charts.funnel.updateSeries([{ name: "Total", data: funnelSeries }]);

    } catch (error) {
        console.error('Erro ao processar dados dos gráficos:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardCards();
    loadDashboardCharts();
    loadRegistrationInfo();
});