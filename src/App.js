import React, { Component } from 'react';
import './App.css';
import { Grid, Container, Header, Form, Dropdown, Checkbox } from 'semantic-ui-react'
import * as d3 from "d3-fetch";

import Pie from './Pie.js'

/**
 * Visualise Titanic survivor data using a pie chart
 */
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      Sex: '',
      Age: [],
      Embarked: [],
      Pclass: ''
    };
    this.handleChange = this.handleChange.bind(this);
  }

  // load the dataset
  componentDidMount() {
    d3.csv("train.csv")
      .then(data => {
        let rows = []
        for (let i = 0; i < data.length; i++) {
          rows.push(data[i]);
        }
        this.setState({
          data: rows,
          filteredData: rows
        });
      });
  }

  handleChange(key, value) {
    // deal with the checkboxes
    if (key === "Embarked") {
      let embarked = this.state[key];
      if (embarked.includes(value)) {
        embarked = embarked.filter(item => item !== value)
      } else {
        embarked.push(value);
      }
      value = embarked;
    }
    if (key === "Age") {
      let ages = this.state[key];
      let ageValue = parseInt(value, 10);
      let ranges = this.getAgeRanges();
      if (ages.find(item => item.value === ageValue)) {
        ages = ages.filter(item => item.value !== ranges[ageValue].value)
      } else {
        ages.push(ranges[ageValue]);
      }
      value = ages;
    }
    this.setState({ [key]: value });
  }

  /**
   * Filter a row from train.csv based on the current state
   * @param {*} item 
   */
  filterState(item) {
    if (this.state.Sex !== '' && item.Sex !== this.state.Sex) {
      return false;
    }
    if (this.state.Age.length !== 0) {
      if (!this.inAgeRange(item.Age)) {
        return false;
      }
    }
    if (this.state.Embarked.length !== 0 && !this.state.Embarked.includes(item.Embarked)) {
      return false;
    }
    if (this.state.Pclass !== '' && this.state.Pclass !== item.Pclass) {
      return false;
    }
    return true;
  }

  /**
   * Get the survivor data for the currently selected filters to generate the chart
   */
  getSurvivors() {
    if (this.state.data.length === 0) {
      return null;
    }
    let filtered = this.state.data.filter(item => this.filterState(item));

    let survived = filtered.length;
    survived = filtered.map(item => parseInt(item.Survived, 10))
      .reduce((total, amount) => total += amount, 0);
    return [
      { label: 'Survived', count: survived },
      { label: 'Died', count: filtered.length - survived },
    ];
  }

  /**
   * The age ranges to display in the checkboxes
   */
  getAgeRanges() {
    return [
      { value: 0, min: 0, max: 16, label: "Under 16" },
      { value: 1, min: 16, max: 25, label: "16 to 25" },
      { value: 2, min: 25, max: 40, label: "25 to 40" },
      { value: 3, min: 40, max: 60, label: "40 to 60" },
      { value: 4, min: 60, max: 200, label: "Over 60" },
      { value: 5, min: null, max: null, label: "Unknown" }
    ];
  }

  /**
   * Check if the age is within the selected ranges
   * @param {*} ticketAge 
   */
  inAgeRange(ticketAge) {
    let currentAge = (ticketAge === "") ? null : parseInt(ticketAge, 10);
    for (let range of this.state.Age) {
      // check for unknown
      if (currentAge === null) {
        if (range.max === null)
          return true;
        else
          return false;
      }
      if (currentAge >= range.min && currentAge < range.max) {
        return true;
      }
    }
    return false;
  }

  render() {
    let pieData = this.getSurvivors();
    return (
      <div id="app">
        <Container>
          <Grid columns={3}>
            <Grid.Row centered columns={1}>
              <Grid.Column width={8}>
                <Header as='h1'>Who survived the Titanic?</Header>
              </Grid.Column>
            </Grid.Row>
            <Grid.Column width={5}>
              <Form>
                <Gender handleChange={(e, { value }) => this.handleChange('Sex', value)} />
                <Embarked handleChange={(e, { value }) => this.handleChange('Embarked', value)} />
                <Age data={this.getAgeRanges()} handleChange={(e, { value }) => this.handleChange('Age', value)} />
                <CabinClass handleChange={(e, { value }) => this.handleChange('Pclass', value)} />
              </Form>
            </Grid.Column>
            <Grid.Column width={1}>
            </Grid.Column>
            <Grid.Column width={8}>
              {pieData && <Pie data={pieData} />}
            </Grid.Column>
          </Grid>
        </Container>
      </div>
    );
  }
}

/**
 * Display the gender select dropdown
 * @param {*} props 
 */
function Gender(props) {
  let options = [{ 'value': '', 'text': 'Not Selected' }, { 'value': 'male', 'text': 'Male' }, { 'value': 'female', 'text': 'Female' }];
  return (
    <Form.Field>
      <label className='name'>What was their gender?</label>
      <Dropdown placeholder='Select Gender' name='Sex' selection options={options} onChange={props.handleChange} />
    </Form.Field>
  );
}

/**
 * Display the checkboxes to select where they embarked
 * @param {*} props 
 */
function Embarked(props) {
  return (
    <div className='checkboxes'>
      <Form.Field>
        <label className='name'>Where did they embark?</label>
        <Checkbox value='C' label='Cherbourg' onChange={props.handleChange} />
      </Form.Field>
      <Form.Field>
        <Checkbox value='Q' label='Queenstown' onChange={props.handleChange} />
      </Form.Field>
      <Form.Field>
        <Checkbox value='S' label='Southampton' onChange={props.handleChange} />
      </Form.Field>
    </div>
  );
}

/**
 * Display the age range checkboxes
 * @param {*} props 
 */
function Age(props) {
  return (
    <div className='checkboxes'>
      <Form.Field>
        <label className='name'>How old were they?</label>
        <Checkbox value='0' label={props.data[0].label} onChange={props.handleChange} />
      </Form.Field>
      <Form.Field>
        <Checkbox value='1' label={props.data[1].label} onChange={props.handleChange} />
      </Form.Field>
      <Form.Field>
        <Checkbox value='2' label={props.data[2].label} onChange={props.handleChange} />
      </Form.Field>
      <Form.Field>
        <Checkbox value='3' label={props.data[3].label} onChange={props.handleChange} />
      </Form.Field>
      <Form.Field>
        <Checkbox value='4' label={props.data[4].label} onChange={props.handleChange} />
      </Form.Field>
      <Form.Field>
        <Checkbox value='5' label={props.data[5].label} onChange={props.handleChange} />
      </Form.Field>
    </div>
  );
}

/**
 * Display the cabin class dropdown
 * @param {*} props 
 */
function CabinClass(props) {
  let options = [{ 'value': '', 'text': 'Not Selected' }, { 'value': '1', 'text': 'First' }, { 'value': '2', 'text': 'Second' }, { 'value': '3', 'text': 'Third' }];
  return (
    <Form.Field>
      <label className='name'>What class was their cabin?</label>
      <Dropdown placeholder='Select Class' name='Pclass' fluid search selection options={options} onChange={props.handleChange} />
    </Form.Field>
  );
}


export default App;
