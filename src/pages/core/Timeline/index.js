import React, { Component } from 'react'
import { connect } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { Container, Row, Col, Button, Alert } from 'reactstrap'
import EventsList, { BlockMenu } from '../Events'
import { NavigationCourse } from '../../../components/Navigation'
import { getDisplayDateTime, mergeMaterials } from '../Helper'
import NextCalendar from '../NextCalendar'
import * as ROUTES from '../../../constants/routes'
import './Timeline.css'
// import withAuthorization from "../../../components/Session/withAuthorization";
import { setUserAdmin, fetchCourseInstance } from '../../../redux/actions'

class Timeline extends Component {
  constructor(props) {
    super(props)

    this.state = {
      course: {},
      eventsSorted: [],
      timelineBlocks: [], // for timeline purposes even Session can be a block
      nestedEvents: [],
    }

    this.getTimelineBlocks = this.getTimelineBlocks.bind(this)
    this.getNestedEvents = this.getNestedEvents.bind(this)
    this.greaterEqual = this.greaterEqual.bind(this)
    this.greater = this.greater.bind(this)
    this.sortEventsFunction = this.sortEventsFunction.bind(this)
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props

    // this.props.fetchCourseInstance(TOKEN, params.id).then(() => {
    //   const { course } = this.props
    //
    //   this.props.fetchEvents(TOKEN, course.id).then(() => {
    //     const { events } = this.props
    //
    //     events.sort(this.sortEventsFunction)
    //
    //     events.map(event => {
    //       event.materials = mergeMaterials(event.uses, event.covers)
    //     })
    //
    //     const timelineBlocks = this.getTimelineBlocks(events)
    //     const nestedEvents = this.getNestedEvents(events, timelineBlocks)
    //
    //     this.setState({
    //       eventsSorted: events,
    //       timelineBlocks,
    //       nestedEvents,
    //     })
    //   })
    // })
  }

  sortEventsFunction(e1, e2) {
    if (new Date(e1.startDate) > new Date(e2.startDate)) {
      return 1
    }
    if (new Date(e1.startDate) < new Date(e2.startDate)) {
      return -1
    }

    if (e1.type > e2.type) {
      return 1
    }
    if (e1.type < e2.type) {
      return -1
    }
    return 0
  }

  getTimelineBlocks(events) {
    const timelineBlocks = []
    timelineBlocks.push(events[0])
    for (let i = 1; i < events.length; i++) {
      const event = events[i]
      const block = timelineBlocks[timelineBlocks.length - 1]
      if (
        event.type === 'block' ||
        new Date(event.startDate) >= new Date(block.endDate)
      ) {
        timelineBlocks.push(event)
      }
    }
    return timelineBlocks
  }

  getNestedEvents(events, timelineBlocks) {
    if (events.length === 0 || timelineBlocks === 0) {
      return timelineBlocks
    }
    for (const block of timelineBlocks) {
      if (block.type === 'Block') {
        block.sessions = []
        block.tasks = []
      }
      for (const event of events) {
        if (block.id !== event.id && event.type !== 'Block') {
          if (
            (event.type === 'Lecture' || event.type === 'Lab') &&
            ((this.greaterEqual(event.startDate, block.startDate) &&
              !this.greaterEqual(event.startDate, block.startDate)) ||
              (this.greater(event.endDate, block.startDate) &&
                !this.greater(event.endDate, block.endDate)))
          ) {
            event.displayDateTime = getDisplayDateTime(event.startDate, false)
            block.sessions.push(event)
            block.materials = mergeMaterials(block.materials, event.materials)
          } else if (
            ((event.type === 'OralExam' || event.type === 'TestTake') &&
              this.greaterEqual(event.startDate, block.startDate) &&
              !this.greaterEqual(event.startDate, block.endDate)) ||
            (event.type === 'Task' &&
              this.greater(event.endDate, block.startDate) &&
              !this.greater(event.endDate, block.endDate))
          ) {
            if (event.type === 'OralExam' || event.type === 'TestTake') {
              event.displayDateTime = getDisplayDateTime(event.startDate, false)
            } else if (event.type === 'Task') {
              event.displayDateTime = getDisplayDateTime(event.endDate, false)
            }
            block.tasks.push(event)
            block.materials = mergeMaterials(block.materials, event.materials)
          }
        }
      }
    }
    return timelineBlocks
  }

  greaterEqual(dateTime1, dateTime2) {
    return new Date(dateTime1) >= new Date(dateTime2)
  }

  greater(dateTime1, dateTime2) {
    return new Date(dateTime1) > new Date(dateTime2)
  }

  render() {
    const { eventsSorted, timelineBlocks, nestedEvents } = this.state
    const { course } = this.props

    return (
      <div>
        <NavigationCourse courseAbbr={course.abbreviation} />
        {eventsSorted.length === 0 ? (
          <Alert color="secondary" className="empty-message">
            Timeline for this course is empty.
            <br />
            {this.props.isAdmin && (
              <NavLink
                to={ROUTES.CREATE_TIMELINE + course.id}
                className="alert-link"
              >
                Create NEW TIMELINE{' '}
              </NavLink>
            )}
          </Alert>
        ) : (
          <Container className="core-container">
            <Row className="timeline-row">
              <Col xs="3" className="timeline-left-col">
                <BlockMenu courseEvents={timelineBlocks} />
                {this.props.isAdmin && ( // || myId===courseInstance.hasInstructor &&
                  <div className="button-container">
                    <NavLink to={`/createtimeline/${course.abbreviation}`}>
                      <Button className="new-event-button">New Event</Button>
                    </NavLink>
                  </div>
                )}
                <NextCalendar />
              </Col>
              <Col className="event-list-col">
                <EventsList
                  courseEvents={nestedEvents}
                  isAdmin={this.props.isAdmin}
                />
              </Col>
            </Row>
          </Container>
        )}
      </div>
    )
  }
}

const mapStateToProps = ({ userReducer, coursesReducer }) => {
  return {
    isSignedIn: userReducer.isSignedIn,
    isAdmin: userReducer.isAdmin,
    course: coursesReducer.course,
  }
}

export default connect(mapStateToProps, { setUserAdmin, fetchCourseInstance })(
  Timeline
)

// const condition = authUser => !!authUser;

// export default withAuthorization(condition)(Timeline);
