import React, { Component } from 'react';
import * as d3 from "d3";

/**
 * Display a d3 pie chart
 */
class Pie extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: {},
        }
        this.width = 460;
        this.height = 460;
        this.radius = Math.min(this.width, this.height) / 2;
        this.pie = d3.pie()
            .value(function (d) { return d.count; })
            .sort(null);
        this.arc = d3.arc()
            .innerRadius(this.radius - 85)
            .outerRadius(this.radius);
    }

    componentDidMount() {
        this.createPieChart();
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        return {
            data: nextProps.data
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        let path = d3.select('g').selectAll('path');
        let arc = this.arc;

        path.data(this.pie(this.state.data));

        path.transition()
            .duration(750)
            .attrTween('d', d => {
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function (t) {
                    return arc(interpolate(t));
                };
            });
        d3.selectAll('.legendLabel')
            .data(this.state.data)
            .text((data) => data.label.toUpperCase() + ": " + data.count);
    }

    createPieChart() {
        let color = d3.scaleOrdinal().range(['#26c6da', '#0d47a1', '#460784', '#673ab7', '#840746']);

        let svg = d3.select('#chart')
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .append('g')
            .attr('transform', 'translate(' + (this.width / 2) +
                ',' + (this.height / 2) + ')');

        let tooltip = d3.select('#chart')
            .append('div')
            .attr('class', 'tooltip');

        tooltip.append('div')
            .attr('class', 'label');

        tooltip.append('div')
            .attr('class', 'count');

        tooltip.append('div')
            .attr('class', 'percent');

        let path = svg.selectAll('path')
            .data(this.pie(this.state.data))
            .enter()
            .append('path')
            .attr('d', this.arc)
            .attr('fill', function (d) {
                return color(d.data.label);
            })
            .each(function (d) { this._current = d; });

        path.transition()
            .duration(750)
            .attrTween('d', d => {
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return t => {
                    return this.arc(interpolate(t));
                };
            });

        path.on('mouseover', d => {
            let total = d3.sum(this.state.data.map(function (d) {
                return d.count;
            }));
            let percent = Math.round(1000 * d.data.count / total) / 10;
            tooltip.select('.label').html(d.data.label);
            tooltip.select('.count').html(d.data.count);
            tooltip.select('.percent').html(percent + '%');
            tooltip.style('display', 'block');
        });

        path.on('mouseout', function () {
            tooltip.style('display', 'none');
        });

        path.on('mousemove', function (d) {
            tooltip.style('top', (d3.event.layerY + 10) + 'px')
                .style('left', (d3.event.layerX + 10) + 'px');
        });

        let legendRectSize = 18;
        let legendSpacing = 4;

        let legend = svg.selectAll('.legend')
            .data(color.domain())
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', function (d, i) {
                let height = legendRectSize + legendSpacing;
                let offset = height * color.domain().length / 2;
                let horz = -2 * legendRectSize;
                let vert = i * height - offset;
                return 'translate(' + horz + ',' + vert + ')';
            });

        legend.append('rect')
            .attr('width', legendRectSize)
            .attr('height', legendRectSize)
            .style('fill', color)
            .style('stroke', color);

        legend.append('text')
            .attr('class', 'legendLabel')
            .attr('x', legendRectSize + legendSpacing)
            .attr('y', legendRectSize - legendSpacing)
            .data(this.state.data)
            .text((data) => data.label.toUpperCase() + ": " + data.count);
    }

    render() {
        return (
            <div id="chart"></div>
        );
    }
}

export default Pie;