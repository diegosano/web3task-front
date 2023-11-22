import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  CardMedia,
  CardContent,
  Typography,
  Card,
  useMediaQuery,
} from "@mui/material";
import SuspenseLoader from "@/components/01-atoms/SuspenseLoader";
import AccessTime from "@mui/icons-material/AccessTime";
import { AlertColor } from "@mui/material/Alert";
import { useTaskService } from "@/services/tasks-service";
import { useWeb3Utils } from "@/hooks/Web3UtilsHook";
import { useTheme } from "@mui/system";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useSnackBar } from "@/contexts/SnackBarContext";

/**
 * CardTasks Component
 *
 * A component that displays a card for an NFT representing a task.
 *
 * @component
 * @param taskId - ID of the Task
 * @param taskData - An array of TaskFront objects representing task data obtained from the Solidity contract function getTask().
 * @param loading - A boolean indicating whether the data is still loading.
 * @returns Card NFT to display
 */

export const CardTask = ({ taskId, taskData, loading }: any) => {
  const {
    startTask,
    reviewTask,
    completeTask,
    cancelTask,
    hasMemberRole,
    hasLeaderRole,
  } = useTaskService();
  const [openError, setOpenError] = useState(false);
  const [error, setError] = useState<string>();
  const [action, setAction] = useState<string>();
  const { userAddress } = useWeb3Utils();
  const [isMember, setIsMember] = useState<boolean>(false);
  const [isLeader, setIsLeader] = useState<boolean>(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const { showSnackBar } = useSnackBar();

  const handleSnackbar = (message: string, color: AlertColor) => {
    showSnackBar(message, color);
  };

  const getAction = (status: string) => {
    switch (status) {
      case "Created":
        setAction("Start Task");
        break;
      case "In Progress":
        setAction("Review Task");
        break;
      case "In Review":
        setAction("Complete Task");
        break;
      default:
        break;
    }
  };

  const handleAction = async () => {
    try {
      switch (taskData.status) {
        case "Created":
          await startTask(BigInt(taskId));
          handleSnackbar("Task Start process initiated with success!", "info");
          break;
        case "In Progress":
          await reviewTask(BigInt(taskId));
          handleSnackbar("Review Task process initiated with success!", "info");
          break;
        case "In Review":
          await completeTask(BigInt(taskId));
          handleSnackbar(
            "Complete Task process initiated with success!",
            "info"
          );
          break;
        default:
          break;
      }
    } catch (error) {
      setError(error.message);
      setOpenError(true);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelTask(BigInt(taskId));
      handleSnackbar("Cancel Task process initiated with success!", "warning");
    } catch (error) {
      setError(error.message);
      setOpenError(true);
    }
  };

  useEffect(() => {
    console.log("taskData", taskData);
    if (taskData != null) {
      getAction(taskData.status);
      hasLeaderRole(userAddress()).then((result) => {
        setIsLeader(result);
        hasMemberRole(userAddress()).then((result) => {
          setIsMember(result);
        });
      });
    }
  }, []);

  return (
    <Grid item xs={"auto"} sm={"auto"} md={"auto"} lg={"auto"}>
      {loading ? (
        <SuspenseLoader />
      ) : (
        <>
          {taskData ? (
            <Box
              display="flex"
              flexDirection={isSmallScreen ? "column" : "row"}
              alignItems="center"
            >
              <Box
                display="flex"
                justifyContent={"center"}
                alignContent={"center"}
              >
                <Box sx={{ position: "relative" }}>
                  <Card sx={{ width: 277, height: 277 }}>
                    <CardMedia
                      sx={{ width: 277, height: 277 }}
                      component="img"
                      image={taskData.metadata}
                      alt={"taskData"}
                    />
                    <CardContent
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: "100%",
                        height: "42px",
                        color: "white",
                        padding: "10px",
                        textAlign: "right",
                        fontFamily: "Istok Web",
                        fontWeight: "400",
                      }}
                    >
                      <Typography
                        gutterBottom
                        variant="body2"
                        style={{
                          textAlign: isSmallScreen ? "left" : "right",
                          marginLeft: isSmallScreen ? "auto" : "unset",
                        }}
                      >
                        Reward {taskData.reward} USD
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>

              <Box flexDirection={"column"} height={"282px"} width={"432px"}>
                <CardContent>
                  <Box>
                    <Box
                      display={"flex"}
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        gutterBottom
                        variant="h3"
                        component="div"
                        textAlign={"left"}
                      >
                        {taskData.title}
                      </Typography>

                      <OpenInNewIcon
                        style={{
                          cursor: "pointer",
                        }}
                      />
                    </Box>
                    <Typography
                      gutterBottom
                      variant="subtitle2"
                      component="div"
                    >
                      #8654
                    </Typography>
                  </Box>

                  <Box mt={4}>
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="div"
                      textAlign={"right"}
                    >
                      Creator Role ID: {taskData.creatorRole}
                    </Typography>
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="div"
                      textAlign={"right"}
                    >
                      Authorized Role ID: [{taskData.authorizedRoles}]
                    </Typography>
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="div"
                      textAlign={"right"}
                    >
                      Assignee: {taskData.assignee}
                    </Typography>
                  </Box>

                  <Box display={"flex"} justifyContent="space-between" mt={6}>
                    {taskData.status != "Completed" &&
                      taskData.status != "Canceled" && (
                        <Button
                          variant="contained"
                          component="span"
                          onClick={handleAction}
                        >
                          {action}
                        </Button>
                      )}
                    <Button
                      startIcon={<AccessTime />}
                      variant="contained"
                      component="span"
                    >
                      End Date: {taskData.endDate}
                    </Button>
                  </Box>

                  {isLeader && taskData.status != "Canceled" && (
                    <Box sx={{ margin: "5px" }}>
                      <Button
                        variant="contained"
                        component="span"
                        onClick={handleCancel}
                      >
                        Cancel Task
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Box>
            </Box>
          ) : (
            console.log("Error Getting Card")
          )}
        </>
      )}
    </Grid>
  );
};

export default CardTask;
