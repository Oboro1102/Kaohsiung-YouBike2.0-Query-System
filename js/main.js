const system = {
    data() {
        return {
            isLoading: false,
            showMessage: false,
            message: '',
            dataBase: [],
            totalSarea: [],
            selectCurrentSarea: '0',
            markers: []
        }
    },
    computed: {
        currentYear() {
            return new Date().getFullYear();
        },
        selectSareaData() {
            let vm = this;
            return vm.dataBase.filter(element => element.sarea === vm.selectCurrentSarea);
        },
        map() {
            return L.map('map', {
                center: [22.621045, 120.311952],
                zoom: 12.5,
            });
        },
        greenIcon() {
            return L.divIcon({
                className: 'divIcon',
                html: "<div class='greenIcon'></div>",
                iconSize: [30, 42],
                iconAnchor: [15, 42],
                tooltipAnchor: [10, -20]
            });
        },
        yellowIcon() {
            return L.divIcon({
                className: 'divIcon',
                html: "<div class='yellowIcon'></div>",
                iconSize: [30, 42],
                iconAnchor: [15, 42],
                tooltipAnchor: [10, -20]
            });
        },
        redIcon() {
            return L.divIcon({
                className: 'divIcon',
                html: "<div class='redIcon'></div>",
                iconSize: [30, 42],
                iconAnchor: [15, 42],
                tooltipAnchor: [10, -20]
            });
        }
    },
    methods: {
        getDataBase() {
            const api = 'https://api.kcg.gov.tw/api/service/Get/b4dd9c40-9027-4125-8666-06bef1756092';
            let vm = this;
            vm.isLoading = true;
            axios({
                method: 'get',
                url: api,
                'Content-Type': 'application/json',
            }).then(response => {
                vm.dataBase = response.data.data.retVal;
                vm.filterSarea();
                vm.isLoading = false;
            }).catch(function (error) {
                vm.showMessage = true;
                vm.message = '高雄市政府提供的 API 服務暫時無法使用，請稍後再試。';
                console.log(error);
            });
        },
        filterSarea() {
            let tempTotalSarea = this.dataBase.map(item => { return item.sarea; });

            this.totalSarea = tempTotalSarea.filter((element, index, array) => {
                return array.indexOf(element) === index;
            });
        },
        callMap() {
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.map);
        },
        setMarker(lat, lng, ar, sna, tot, sbi, bemp) {
            const vm = this;
            let content = `<h2 class="info__title">${sna.split('_')[1]}</h2></b><p class="info__content">地址：${ar}</p><p class="info__content">可借車輛：${sbi}</p><p class="info__content">可停空位：${bemp}</p>`;

            if (sbi <= parseInt(Number(tot) * 15 / 100)) {
                vm.markers.push(L.marker([lat, lng], { icon: vm.redIcon }).bindTooltip(content));
            } else if (sbi > parseInt(Number(tot) * 15 / 100) && sbi <= parseInt(Number(tot) * 45 / 100)) {
                vm.markers.push(L.marker([lat, lng], { icon: vm.yellowIcon }).bindTooltip(content));
            } else {
                vm.markers.push(L.marker([lat, lng], { icon: vm.greenIcon }).bindTooltip(content));
            }
        },
        removeMarker() {
            let vm = this;

            L.layerGroup(vm.markers).eachLayer(element => {
                element.removeFrom(vm.map);
            });
            vm.markers = [];
        },
        showMarker() {
            let vm = this;
            vm.removeMarker();
            vm.selectSareaData.forEach(element => {
                vm.setMarker(Number(element.lat), Number(element.lng), element.ar, element.sna, element.tot, element.sbi, element.bemp);
            });
            L.layerGroup(vm.markers).addTo(vm.map);

            if (vm.markers.length > 1) {
                vm.jumpToMap(parseInt(vm.markers.length / 2), 14);
            } else {
                vm.jumpToMap(0, 14);
            }
        },
        jumpToMap(index, zoom) {
            this.map.flyTo([Number(this.markers[index]._latlng.lat), Number(this.markers[index]._latlng.lng)], zoom);
        }
    },
    created() {
        this.getDataBase();
    },
    mounted() {
        this.callMap();
    },
};

Vue.createApp(system).mount('#app');