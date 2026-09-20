const { mongoose } = require('../config/database');

const reportSchema = new mongoose.Schema(
    {
        description: {
            type: String,
            required: true,
            trim: true
        },
        location: {
            type: String,
            required: true,
            trim: true
        },
        // Geolocalización del reporte (para mostrarlo en el mapa).
        // GeoJSON Point: [longitud, latitud], como lo espera Mongo/Leaflet.
        geo: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [lng, lat]
                default: undefined
            }
        },
        photo: {
            type: String,
            required: false
        },
        status: {
            type: String,
            enum: ['pending', 'in_progress', 'resolved'],
            default: 'pending'
        },
        // Relación uno-a-muchos: un User tiene muchos Reports.
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false
        }
    },
    { timestamps: true }
);

reportSchema.index({ geo: '2dsphere' });

// Expone lat/lng "planos" además del GeoJSON, para que el frontend
// no tenga que preocuparse por el formato [lng, lat].
reportSchema.virtual('lat').get(function getLat() {
    return this.geo?.coordinates ? this.geo.coordinates[1] : undefined;
});
reportSchema.virtual('lng').get(function getLng() {
    return this.geo?.coordinates ? this.geo.coordinates[0] : undefined;
});
reportSchema.set('toJSON', { virtuals: true });
reportSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Report', reportSchema);
