import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Box, Container, Divider, IconButton, Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShareIcon from "@mui/icons-material/Share";
import VisibilityIcon from "@mui/icons-material/Visibility";

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
}));

const NoticeHeader = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    gap: theme.spacing(2),
}));

const NoticeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openSnackbar, setOpenSnackbar] = useState(false);

    useEffect(() => {
        const fetchNotice = async () => {
            try {
                const noticeResponse = await axios.get(`http://localhost:3001/api/notice/${id}`);
                setNotice(noticeResponse.data);
            } catch (error) {
                console.error("공지사항 상세 조회 실패: " + error);
                //setOpenSnackbar(true);
            } finally {
                setLoading(false);
            }
        };

        fetchNotice();
    }, [id]);


    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setOpenSnackbar(true);
    }



    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 14 }}>
                <Typography>로딩 중...</Typography>
            </Container>
        );
    }

    if (!notice) {
        return (
            <Container maxWidth="lg" sx={{ py: 14 }}>
                <Typography>공지사항을 찾을 수 없습니다.</Typography>
            </Container>
        );
    }




    return (
        <Container maxWidth="lg" sx={{ py: 14 }}>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <IconButton onClick={() => navigate(-1)} aria-label="뒤로가기">
                    <ArrowBackIcon />
                </IconButton>
                <IconButton onClick={handleShare} aria-label="공유하기">
                    <ShareIcon />
                </IconButton>
            </Box>

            <StyledPaper elevation={2}>
                <NoticeHeader>
                    <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                No. {notice.id}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    작성자. {notice.authorId}
                                </Typography>
                            </Box>
                        </Box>
                        <Typography variant="h5" component="h1" gutterBottom>
                            {notice.title}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 2, color: "text.secondary" }}>
                            <Typography variant="body2">
                                {new Date(notice.createdAt).toISOString().split('T')[0]}
                            </Typography>
                        </Box>
                    </Box>
                </NoticeHeader>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ my: 4 }}>
                    <div dangerouslySetInnerHTML={{ __html: notice.content }} style={{ lineHeight: 1.8, fontSize: "1.2rem" }}/>
                </Box>
            </StyledPaper>
        </Container>
    );
};

export default NoticeDetail;