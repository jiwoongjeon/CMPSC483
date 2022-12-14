import React from 'react'
import './summary-boxStudents.scss'
import Box from '../box/Box'
import { Line } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

const SummaryBoxStudents = ({ item }) => {
    return (
        <Box>
            <div className='summary-box'>
                <div className="summary-box__info">
                    <div className="summary-box__info__title">
                        <div>{item.title}</div>
                        <span>{item.subtitle}</span>

                    </div>
                    <div className="summary-box__info__value">
                        {item.value}
                    </div>
                </div>
                <div className="summary-box__info">
                    <div className="summary-box__info__title">
                        <title>{item.title}</title>
                        <span>{item.subtitle}</span>
                    </div>
                    <div className="summary-box__info__value">
                        {item.percent}
                    </div>
                </div>
                <div className='summary-box__open'>
                    <button>Open</button>
                </div>

                
            </div>
        </Box>
    )
}

export default SummaryBoxStudents

export const SummaryBoxSpecial = ({ item }) => {
    const chartOptions = {
        responsive: true,
        scales: {
            xAxis: {
                display: false
            },
            yAxis: {
                display: false
            }
        },
        plugins: {
            legend: {
                display: false
            }
        },
        elements: {
            point: {
                radius: 0
            }
        }
    }

    const chartData = {
        labels: item.chartData.labels,
        datasets: [
            {
                label: 'Students',
                data3: item.chartData.data3,
                borderColor: '#fff',
                tension: 0.5
            }
        ]
    }
    return (
        <Box purple fullheight>
            <div className="summary-box-special">
                <div className="summary-box-special__title">
                    {item.title}
                </div>
                
                <div className="summary-box-special__value">
                    {item.value}
                </div>
                <div className="summary-box-special__chart">
                    <Line options={chartOptions} data={chartData} width={`250px`} />
                </div>
            </div>
        </Box>
    )
}
