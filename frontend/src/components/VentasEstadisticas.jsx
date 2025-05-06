import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './VentasEstadisticas.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const VentasEstadisticas = () => {
    const [estadisticas, setEstadisticas] = useState({
        totalVentas: 0,
        ventasPorCategoria: {},
        ventasPorMes: {}
    });

    useEffect(() => {
        const fetchEstadisticas = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/sales/estadisticas');
                setEstadisticas(response.data);
            } catch (error) {
                console.error('Error al obtener estadísticas:', error);
            }
        };

        fetchEstadisticas();
    }, []);

    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const dataPorMes = {
        labels: meses,
        datasets: [
            {
                label: 'Ventas por Mes',
                data: meses.map((_, index) => estadisticas.ventasPorMes[index] || 0),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const dataPorCategoria = {
        labels: Object.keys(estadisticas.ventasPorCategoria),
        datasets: [
            {
                label: 'Ventas por Categoría',
                data: Object.values(estadisticas.ventasPorCategoria),
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 14
                    }
                }
            },
            title: {
                display: true,
                text: 'Estadísticas de Ventas',
                font: {
                    size: 18,
                    weight: 'bold'
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    font: {
                        size: 12
                    }
                }
            },
            x: {
                ticks: {
                    font: {
                        size: 12
                    }
                }
            }
        }
    };

    return (
        <div className="ventas-estadisticas">
            <div className="resumen-total">
                <div className="resumen-card">
                    <h2>Resumen de Ventas</h2>
                    <div className="total-ventas">
                        <span className="moneda">S/.</span>
                        <span className="monto">{Number(estadisticas.totalVentas || 0).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="graficos-container">
                <div className="grafico-card">
                    <h3>Ventas por Mes</h3>
                    <div className="grafico-wrapper">
                        <Bar options={options} data={dataPorMes} />
                    </div>
                </div>

                <div className="grafico-card">
                    <h3>Ventas por Categoría</h3>
                    <div className="grafico-wrapper">
                        <Bar options={options} data={dataPorCategoria} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VentasEstadisticas; 