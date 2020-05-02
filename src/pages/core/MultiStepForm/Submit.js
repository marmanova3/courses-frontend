import React from 'react'
import {
  BASE_URL,
  COURSE_URL,
  COURSE_INSTANCE_URL,
  EVENT_URL,
} from '../constants'
import { axiosRequest } from '../AxiosRequests'
import { Alert, Button, CardSubtitle, Col, Table } from 'reactstrap'
import { connect } from 'react-redux'
import { setCourseMigrationState } from '../../../redux/actions'
import { getShortId } from '../Helper'
import { addDays, dateDiffInDays } from '../Timeline/timeline-helper'

class Submit extends React.Component {
  constructor() {
    super()

    this.state = {
      errors: [],
      sent: false,
    }
  }

  migrate = () => {
    const {
      name,
      description,
      startDate,
      endDate,
      instanceOf,
      instructors,
    } = this.props.courseMigrationState

    const { errors } = this.state

    const courseId = getShortId(instanceOf[0]['@id'])
    const courseFullId = [
      `http://www.courses.matfyz.sk/data${COURSE_URL}/${courseId}`,
    ]

    const hasInstructor = instructors.map(instructor => {
      return instructor.fullId
    })

    const data = {
      name,
      description,
      startDate,
      endDate,
      hasInstructor,
      instanceOf: courseFullId,
    }

    const url = BASE_URL + COURSE_INSTANCE_URL

    axiosRequest('post', JSON.stringify(data), url)
      .then(response => {
        if (response && response.status === 200) {
          this.createEvents(response.data.resource.iri)
        } else {
          errors.push(
            'There was a problem with server while sending your form. Try again later.'
          )
          this.setState({
            errors,
          })
        }
      })
      .catch()
  }

  createEvents = courseId => {
    const {
      allEvents,
      checkedEvents,
      startDate,
    } = this.props.courseMigrationState
    const { courseInstance } = this.props

    console.log(new Date(courseInstance.startDate))
    console.log(startDate)
    const noOfDays = dateDiffInDays(
      new Date(courseInstance.startDate),
      startDate
    )
    console.log(noOfDays)

    let eventsToAdd = []

    for (let event of allEvents) {
      if (checkedEvents.includes(event.id)) {
        const newStartDate = addDays(event.startDate, noOfDays)
        const newEndDate = addDays(event.endDate, noOfDays)
        const e = {
          name: event.name,
          description: event.description,
          startDate: newStartDate,
          endDate: newEndDate,
          courseInstance: courseId,
          _type: event.type,
        }
        eventsToAdd.push(e)
      }
    }

    console.log(eventsToAdd)

    const url = BASE_URL + EVENT_URL
    let errors = []
    for (let event of eventsToAdd) {
      console.log(event)
      axiosRequest('post', JSON.stringify(event), url)
        .then(response => {
          if (response && response.status === 200) {
          } else {
            errors.push(
              `There was a problem with server while posting ${event.name}`
            )
          }
        })
        .catch()
    }

    if (errors.length > 0) {
      console.log(errors)
    }

    this.setState({
      sent: true,
    })
  }

  render() {
    const { sent } = this.state
    const { courseMigrationState } = this.props
    const { go } = this.props.navigation

    return (
      <div>
        {sent && (
          <>
            <Alert color="secondary">New run of Course Instance Created!</Alert>
            <div className="button-container-migrations">
              <Button className="new-event-button" onClick={() => go('course')}>
                New Course Migration
              </Button>
            </div>
          </>
        )}
        <CardSubtitle className="card-subtitle-migrations">Overview</CardSubtitle>
        {courseMigrationState && (
          <Table>
            <tr>
              <td>Name</td>
              <td>{courseMigrationState.name}</td>
            </tr>
            <tr>
              <td>Description</td>
              <td>{courseMigrationState.description}</td>
            </tr>
            <tr>
              <td>From</td>
              <td>{courseMigrationState.startDate.toString()}</td>
            </tr>
            <tr>
              <td>To</td>
              <td>{courseMigrationState.endDate.toString()}</td>
            </tr>
            <tr>
              <td>Instructors</td>
              <td>
                {courseMigrationState.instructors.map(i => i.name + '; ')}
              </td>
            </tr>
            <tr>
              <td>Events</td>
              <td>
                {courseMigrationState.allEvents.map(e => {
                  if (courseMigrationState.checkedEvents.includes(e.id)) {
                    return e.name + '; '
                  }
                })}
              </td>
            </tr>
          </Table>
        )}
        {!sent && (
          <div className="button-container-migrations">
            <Button className="new-event-button" onClick={this.migrate}>
              Migrate
            </Button>
          </div>
        )}
      </div>
    )
  }
}

const mapStateToProps = ({ courseInstanceReducer, courseMigrationReducer }) => {
  return {
    courseInstance: courseInstanceReducer.courseInstance,
    courseMigrationState: courseMigrationReducer,
  }
}

export default connect(mapStateToProps, { setCourseMigrationState })(Submit)