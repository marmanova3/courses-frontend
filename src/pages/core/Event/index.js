import React from 'react'
import {
  Container,
  Row,
  Col,
  Card,
  CardSubtitle,
  CardHeader,
  CardBody,
  CardText,
  ListGroup,
  ListGroupItem,
  Button,
  Table,
} from 'reactstrap'
import { connect } from 'react-redux'
import { NavLink } from 'react-router-dom'

import './Event.css'
import { SubEventList } from '../Events'
import {
  getDisplayDateTime,
  getIcon,
  getShortId,
  mergeMaterials,
} from '../Helper'
import { BASE_URL, EVENT_URL, INITIAL_EVENT_STATE, TOKEN } from '../constants'
import { axiosRequest, getData } from '../AxiosRequests'
import { redirect } from '../../../constants/redirect'
import * as ROUTES from '../../../constants/routes'

class Event extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      event: INITIAL_EVENT_STATE,
    }
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props

    const url = `${BASE_URL + EVENT_URL}/${
      params.event_id
    }?_join=courseInstance,uses,recommends`
    axiosRequest('get', TOKEN, null, url).then(response => {
      const data = getData(response)
      if (data != null && data !== []) {
        const event = data.map(eventData => {
          return {
            id: getShortId(eventData['@id']),
            name: eventData.name,
            description: eventData.description,
            startDate: new Date(eventData.startDate),
            endDate: new Date(eventData.endDate),
            place: eventData.location,
            type: eventData['@type'].split('#')[1],
            uses: eventData.uses.map(material => {
              return {
                id: getShortId(material['@id']),
                fullId: material['@id'],
                name: material.name,
              }
            }),
            recommends: eventData.recommends.map(material => {
              return {
                id: getShortId(material['@id']),
                fullId: material['@id'],
                name: material.name,
              }
            }),
            courseInstance: eventData.courseInstance[0]['@id'],
          }
        })[0]
        if (getShortId(event.courseInstance) !== params.course_id) {
          //TODO redirect wrong event for courseInstance
        }
        event.materials = mergeMaterials(event.uses, event.recommends)
        this.setState({
          event,
        })
      } else {
        // TODO redirect to 404? zle id
        console.log('Something went wrong!')
      }
    })
  }

  render() {
    const { event } = this.state
    const { user } = this.props
    return (
      <div>
        <Container>
          {event && (
            <EventCard
              event={event}
              isAdmin={user ? user.isSuperadmin : false}
            />
          )}
        </Container>
      </div>
    )
  }
}

const EventCard = ({ event, isAdmin }) => (
  <Card id={`${event.id}`} name={`${event.id}`} className="event-card">
    <CardHeader className="event-card-header">
      <NavLink
        to={redirect(ROUTES.EVENT_ID, [
          { key: 'course_id', value: getShortId(event.courseInstance) },
          { key: 'event_id', value: event.id },
        ])}
        className="subevent-name"
      >
        {event.name}
      </NavLink>
      {isAdmin && (
        <NavLink
          to={redirect(ROUTES.EDIT_EVENT_ID, [
            { key: 'course_id', value: getShortId(event.courseInstance)},
            { key: 'event_id', value: event.id },
          ])}
        >
          <Button className="edit-button"> Edit</Button>
        </NavLink>
      )}
    </CardHeader>
    <CardBody>
      <CardText className="event-card-text">{event.description}</CardText>
      <Table borderless className="event-table">
        <tbody>
          <tr>
            <th>Start</th>
            <td>{getDisplayDateTime(event.startDate, true)}</td>
            <th>End</th>
            <td>{getDisplayDateTime(event.endDate, true)}</td>
          </tr>
          {/*TODO uncomment*/}
          {/*{event.location &&*/}
          {/*<tr>*/}
          {/*    <th>Location</th><td colSpan="3">{event.location}</td>*/}
          {/*</tr>*/}
          {/*}*/}
        </tbody>
      </Table>
      {event.type === 'Block' && (
        <Container className="sessions-tasks-container core-container">
          <Row>
            <Col className="subevents-col-left">
              <CardSubtitle className="subevents-title">Sessions</CardSubtitle>
              <SubEventList events={event.sessions} />
            </Col>
            <Col className="subevents-col-right">
              <CardSubtitle className="subevents-title">Tasks</CardSubtitle>
              <SubEventList events={event.tasks} />
            </Col>
          </Row>
        </Container>
      )}
      {event.materials && event.materials.length > 0 && (
        <>
          <CardSubtitle className="event-card-subtitle">Materials</CardSubtitle>
          <ListGroup key={event.id}>
            {event.materials.map(material => (
              <ListGroupItem
                key={material.id}
                className="event-list-group-item"
              >
                {getIcon('Material')}
                <div className="material-name">{material.name}</div>
              </ListGroupItem>
            ))}
          </ListGroup>
        </>
      )}
    </CardBody>
  </Card>
)

const mapStateToProps = ({ userReducer }) => {
  return {
    user: userReducer.user,
  }
}

export default connect(mapStateToProps)(Event)

export { EventCard }
