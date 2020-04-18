import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
// import {withAuthorization} from "../../../components/Session";
import { Container, Card, CardHeader, CardBody } from 'reactstrap'
import CourseForm from '../CourseForm'
import Navigation from '../../../components/Navigation'
import { BASE_URL, COURSE_URL, INITIAL_COURSE_STATE, TOKEN } from '../constants'
import { axiosRequest, getData } from '../AxiosRequests'

class EditCourse extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      course: this.props.course,
    }
  }

  componentDidMount() {


    // const {
    //   match: { params },
    // } = this.props
    //
    // const url = `${BASE_URL + COURSE_URL}/${params.id}?_join=hasPrerequisite`
    // axiosRequest('get', TOKEN, null, url).then(response => {
    //   const data = getData(response)
    //   if (data != null) {
    //     const course = data.map(courseData => {
    //       return {
    //         id: courseData['@id'].substring(courseData['@id'].length - 5),
    //         name: courseData.name,
    //         abbreviation: courseData.abbreviation,
    //         description: courseData.description,
    //         prerequisites: courseData.hasPrerequisite.map(prerequisite => {
    //           return { fullId: prerequisite['@id'], name: prerequisite.name }
    //         }),
    //         admins: courseData.hasAdmin.map(admin => {
    //           return { fullId: admin['@id'], name: admin.name }
    //         }),
    //       }
    //     })[0]
    //     this.setState({
    //       course,
    //     })
    //   } else {
    //     //TODO zle id
    //   }
    // })
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.course !== this.props.course) {
      this.setState({ ...this.props })
    }
  }

  render() {
    return (
      <div>
        <Container className="event-card-header">
          <Card>
            <CardHeader>Edit Course</CardHeader>
            <CardBody>
              <CourseForm typeOfForm="Edit" {...this.state.course} />
            </CardBody>
          </Card>
        </Container>
      </div>
    )
  }
}

const mapStateToProps = ({ courseInstanceReducer }) => {
  return {
    course: courseInstanceReducer.courseInstance,
  }
}

export default compose(
  connect(mapStateToProps)
  // withAuthorization(condition)
)(EditCourse)
