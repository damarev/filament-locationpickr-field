import { Loader } from '@googlemaps/js-api-loader'

export default function locationPickrField({ location, config }) {
    return {
        map: null,
        marker: null,
        markerLocation: null,
        infoWindow: null,
        loader: null,
        location: null,
        config: {
            draggable: true,
            clickable: false,
            defaultZoom: 8,
            controls: {
                mapTypeControl: true,
                scaleControl: true,
                streetViewControl: true,
                rotateControl: true,
                fullscreenControl: true,
                zoomControl: false,
            },
            myLocationButtonLabel: '',
            sourceAddress: '',
            defaultRegion: 'es',
            defaultLocation: {
                lat: 0,
                lng: 0,
            },
            apiKey: '',
            statePath: '',
        },

        init: function () {
            this.location = location
            this.config = { ...this.config, ...config }
            this.loadGmaps()
            this.$watch('location', (value) => this.updateMapFromAlpine())
        },

        loadGmaps: function () {
            this.loader = new Loader({
                apiKey: this.config.apiKey,
                version: 'weekly',
            })

            this.loader
                .load()
                .then((google) => {
                    this.map = new google.maps.Map(this.$refs.map, {
                        center: this.getCoordinates(),
                        zoom: this.config.defaultZoom,
                        ...this.config.controls,
                    })

                    this.infoWindow = new google.maps.InfoWindow()

                    this.marker = new google.maps.Marker({
                        draggable: this.config.draggable,
                        map: this.map,
                    })
                    this.marker.setPosition(this.getCoordinates())
                    this.setCoordinates(this.marker.getPosition())

                    if (this.config.clickable) {
                        this.map.addListener('click', (event) => {
                            this.markerMoved(event)
                        })
                    }

                    if (this.config.draggable) {
                        google.maps.event.addListener(
                            this.marker,
                            'dragend',
                            (event) => {
                                this.markerMoved(event)
                            },
                        )
                    }

                    const mapTools = document.createElement('div')
                    mapTools.classList.add('map-tools')

                    mapTools.appendChild(this.createSearchInput())

                    if (this.config.sourceAddress) {
                        mapTools.appendChild(this.createFindmeButton())
                    }

                    const inputElement = document.createElement('input')
                    inputElement.type = 'text'
                    inputElement.placeholder = 'Search...'

                    const searchBox = new google.maps.places.SearchBox(
                        inputElement,
                    )

                    searchBox.addListener('places_changed', () => {
                        inputElement.value = ''
                        map.setZoom(18)
                        console.log(searchBox.getPlaces())
                        this.setMarkerLocation(
                            searchBox.getPlaces()[0].geometry.location,
                        )
                    })

                    // mapTools.appendChild(this.createLocationButton())
                    this.map.controls[
                        google.maps.ControlPosition.TOP_LEFT
                    ].push(mapTools)
                })
                .catch((error) => {
                    console.error('Error loading Google Maps API:', error)
                })
        },

        createSearchInput: function () {
            const inputElement = document.createElement('input')
            inputElement.type = 'text'
            inputElement.placeholder = 'Search...'
            inputElement.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault()
                    console.log(`You entered: ${inputElement.value}`)
                    this.fetchGeolocation(inputElement.value)
                    inputElement.value = ''
                }
            })

            return inputElement
        },

        createFindmeButton: function () {
            const button = document.createElement('button')
            button.type = 'button'
            button.title = this.config.sourceAddress
            // button.textContent = this.config.mybuttonLabel
            button.classList.add('findme')
            button.addEventListener('click', (event) => {
                event.preventDefault()
                this.fetchGeolocation(this.config.sourceAddress)
            })

            return button
        },

        createLocationButton: function () {
            const locationButton = document.createElement('button')
            locationButton.type = 'button'
            locationButton.textContent = this.config.myLocationButtonLabel
            locationButton.classList.add('location-button')
            locationButton.addEventListener('click', (event) => {
                event.preventDefault()
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            this.markerLocation = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude,
                            }
                            this.setCoordinates(this.markerLocation)
                            this.marker.setPosition(this.markerLocation)
                            this.map.panTo(this.markerLocation)
                        },
                        () => {
                            this.myLocationError(
                                true,
                                this.infoWindow,
                                this.map.getCenter(),
                            )
                        },
                    )
                } else {
                    this.myLocationError(
                        false,
                        this.infoWindow,
                        this.map.getCenter(),
                    )
                }
            })

            return locationButton
        },

        markerMoved: function (event) {
            this.markerLocation = event.latLng.toJSON()
            this.setCoordinates(this.markerLocation)
            this.marker.setPosition(this.markerLocation)
            this.map.panTo(this.markerLocation)
        },

        setMarkerLocation: function (lat, lng) {
            this.markerLocation = {
                lat,
                lng,
            }
            this.setCoordinates(this.markerLocation)
            this.marker.setPosition(this.markerLocation)
            this.map.panTo(this.markerLocation)
            this.map.setZoom(18)
        },

        updateMapFromAlpine: function () {
            const location = this.getCoordinates()
            const markerLocation = this.marker.getPosition()
            if (
                !(
                    location.lat === markerLocation.lat() &&
                    location.lng === markerLocation.lng()
                )
            ) {
                this.updateMap(location)
            }
        },

        fetchGeolocation: function (address) {
            const queryString = new URLSearchParams({
                key: this.config.apiKey,
                region: this.defaultRegion,
                address,
            }).toString()

            const url = `https://maps.googleapis.com/maps/api/geocode/json?${queryString}`

            fetch(url)
                .then((response) => response.json())
                .then((data) => {
                    if (data.status === 'OK') {
                        this.setMarkerLocation(
                            data.results[0].geometry.location.lat,
                            data.results[0].geometry.location.lng,
                        )
                    } else {
                        throw new Error('ERR: No results!')
                    }
                })
                .catch((error) => {
                    console.error('ERR: Error making request:', error)
                    alert('Error making request: ' + error)
                })
        },

        updateMap: function (position) {
            this.marker.setPosition(position)
            this.map.panTo(position)
        },

        setCoordinates: function (position) {
            this.$wire.set(this.config.statePath, position)
        },

        getCoordinates: function () {
            let location = this.$wire.get(this.config.statePath)
            if (
                location === null ||
                !location.hasOwnProperty('lat') ||
                !location.hasOwnProperty('lng')
            ) {
                location = {
                    lat: this.config.defaultLocation.lat,
                    lng: this.config.defaultLocation.lng,
                }
            }
            return location
        },

        myLocationError: function (browserHasGeolocation, infoWindow, pos) {
            infoWindow.setPosition(pos)
            infoWindow.setContent(
                browserHasGeolocation
                    ? 'Error: The Geolocation service failed.'
                    : "Error: Your browser doesn't support geolocation.",
            )
            infoWindow.open(this.map)
        },
    }
}
