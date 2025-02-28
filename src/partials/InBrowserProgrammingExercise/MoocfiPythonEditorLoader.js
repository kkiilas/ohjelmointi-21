import React from "react"
import styled from "styled-components"
import { withTranslation } from "react-i18next"

import LoginStateContext from "../../contexes/LoginStateContext"
import LoginControls from "../../components/LoginControls"
import withSimpleErrorBoundary from "../../util/withSimpleErrorBoundary"
import { accessToken, getCourseVariant } from "../../services/moocfi"
import ProgrammingExerciseCard from "../ProgrammingExercise/ProgrammingExerciseCard"
import { ProgrammingExercise } from "moocfi-python-editor"
import CourseSettings from "../../../course-settings"
import { Typography } from "@material-ui/core"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faClock } from "@fortawesome/free-solid-svg-icons"

let language = "en"
if (CourseSettings.language === "fi") {
  language = "fi"
}

const Wrapper = styled.div`
  padding 1rem;
`

const StyledDeadlineText = styled(Typography)`
  padding: 0.25rem 0 1rem 0 !important;
  color: rgb(108, 117, 125) !important;
  font-size: 0.8rem !important;
  font-weight: bold !important;
`

const StyledIcon = styled(FontAwesomeIcon)`
  font-size: 0.9rem !important;
  margin-right: 0.25em !important;
  vertical-align: -0.1em !important;
`

class InBrowserProgrammingExercisePartial extends React.Component {
  static contextType = LoginStateContext

  state = {
    exerciseDetails: undefined,
    organization: undefined,
    course: undefined,
    render: false,
  }

  async componentDidMount() {
    const { tmcOrganization, tmcCourse } = await getCourseVariant()
    this.setState({
      render: true,
      organization: tmcOrganization,
      course: tmcCourse,
    })
  }

  onUpdate = (exerciseDetails) => {
    this.setState({
      exerciseDetails,
    })
  }

  render() {
    const {
      t,
      name,
      tmcname,
      children,
      height,
      outputheight,
      outputposition,
      difficulty,
    } = this.props

    if (!this.state.render) {
      return <div>Loading</div>
    }

    const loginPrompt = (
      <div style={{ padding: "1rem", textAlign: "center" }}>
        <p>{t("loginToAttemptExercise")}</p>
        <LoginControls />
      </div>
    )

    const details = this.state.exerciseDetails
    const deadline = details?.deadline ? new Date(details.deadline) : null

    return (
      <ProgrammingExerciseCard
        name={name}
        points={details?.availablePoints}
        awardedPoints={details?.awardedPoints}
        allowRefresh={false}
        completed={details?.completed || false}
        difficulty={difficulty}
      >
        <div>
          {deadline instanceof Date && !isNaN(deadline.getTime()) && (
            <StyledDeadlineText>
              <StyledIcon icon={faClock} />
              {`Deadline: ${deadline.toLocaleString("en-GB")}`}
            </StyledDeadlineText>
          )}
          <Wrapper>{children}</Wrapper>
          {this.context.loggedIn ? (
            <ProgrammingExercise
              onExerciseDetailsChange={(details) => this.onUpdate(details)}
              organization={this.state.organization}
              course={this.state.course}
              exercise={tmcname}
              token={accessToken()}
              height={height ? height : "300px"}
              outputHeight={outputheight ? outputheight : "auto"}
              outputPosition={outputposition || "relative"}
              language={language}
            />
          ) : (
            loginPrompt
          )}
        </div>
      </ProgrammingExerciseCard>
    )
  }
}

export default withTranslation("common")(
  withSimpleErrorBoundary(InBrowserProgrammingExercisePartial),
)
