using NUnit.Framework;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using Relevantz.SOR.Api.Controllers;
using Relevantz.SOR.Core.IService;
using Relevantz.SOR.Common.DTOs.Request.ApprovalChain;
using Relevantz.SOR.Common.DTOs.Response;

namespace Relevantz.SOR.Api.Tests.Controllers
{
    [TestFixture]
    public class ApprovalChainControllerTests
    {
        private Mock<IApprovalChainService> _mockChainService;
        private Mock<ITokenService> _mockTokenService;
        private ApprovalChainController _controller;

        [SetUp]
        public void Setup()
        {
            _mockChainService = new Mock<IApprovalChainService>();
            _mockTokenService = new Mock<ITokenService>();
            _controller = new ApprovalChainController(
                _mockChainService.Object,
                _mockTokenService.Object);

            var httpContext = new DefaultHttpContext();
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, "1"),
                new Claim(ClaimTypes.Role, "HR")
            };
            var identity = new ClaimsIdentity(claims, "TestAuth");
            httpContext.User = new ClaimsPrincipal(identity);
            _controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
        }

        // ──────────────────────────────────────────────
        // GetByDepartment — returns ApiResponseDto<IEnumerable<ApprovalChainResponseDto>>
        // ──────────────────────────────────────────────

        // Test 1
        [Test]
        public async Task GetByDepartment_WithValidDepartmentId_ReturnsOkResult()
        {
            // Arrange
            int departmentId = 1;
            var expectedResult = new ApiResponseDto<IEnumerable<ApprovalChainResponseDto>>
            {
                Success = true,
                Data = new List<ApprovalChainResponseDto>()
            };
            _mockChainService
                .Setup(s => s.GetByDepartmentAsync(departmentId))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.GetByDepartment(departmentId);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
        }

        // Test 2
        [Test]
        public async Task GetByDepartment_ReturnsOkWithEmptyList()
        {
            // Arrange
            int departmentId = 99;
            var expectedResult = new ApiResponseDto<IEnumerable<ApprovalChainResponseDto>>
            {
                Success = true,
                Data = new List<ApprovalChainResponseDto>()
            };
            _mockChainService
                .Setup(s => s.GetByDepartmentAsync(departmentId))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.GetByDepartment(departmentId);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
        }

        // Test 3
        [Test]
        public async Task GetByDepartment_VerifiesServiceCalledOnce()
        {
            // Arrange
            int departmentId = 2;
            _mockChainService
                .Setup(s => s.GetByDepartmentAsync(departmentId))
                .ReturnsAsync(new ApiResponseDto<IEnumerable<ApprovalChainResponseDto>>());

            // Act
            await _controller.GetByDepartment(departmentId);

            // Assert
            _mockChainService.Verify(s => s.GetByDepartmentAsync(departmentId), Times.Once);
        }

        // Test 4
        [Test]
        public async Task GetByDepartment_PassesCorrectDepartmentIdToService()
        {
            // Arrange
            int expectedDepartmentId = 5;
            int capturedId = 0;
            _mockChainService
                .Setup(s => s.GetByDepartmentAsync(It.IsAny<int>()))
                .Callback<int>(id => capturedId = id)
                .ReturnsAsync(new ApiResponseDto<IEnumerable<ApprovalChainResponseDto>>());

            // Act
            await _controller.GetByDepartment(expectedDepartmentId);

            // Assert
            Assert.That(capturedId, Is.EqualTo(expectedDepartmentId));
        }

        // ──────────────────────────────────────────────
        // GetById — returns ApiResponseDto<ApprovalChainResponseDto>
        // ──────────────────────────────────────────────

        // Test 5
        [Test]
        public async Task GetById_WithExistingChain_ReturnsOkResult()
        {
            // Arrange
            int chainId = 1;
            var expectedResult = new ApiResponseDto<ApprovalChainResponseDto>
            {
                Success = true,
                Data = new ApprovalChainResponseDto()
            };
            _mockChainService
                .Setup(s => s.GetByIdAsync(chainId))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.GetById(chainId);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
        }

        // Test 6
        [Test]
        public async Task GetById_WithNonExistingChain_ReturnsNotFound()
        {
            // Arrange
            int chainId = 999;
            var expectedResult = new ApiResponseDto<ApprovalChainResponseDto>
            {
                Success = false,
                Message = "Chain not found"
            };
            _mockChainService
                .Setup(s => s.GetByIdAsync(chainId))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.GetById(chainId);

            // Assert
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        // Test 7
        [Test]
        public async Task GetById_VerifiesServiceCalledWithCorrectId()
        {
            // Arrange
            int chainId = 3;
            _mockChainService
                .Setup(s => s.GetByIdAsync(chainId))
                .ReturnsAsync(new ApiResponseDto<ApprovalChainResponseDto> { Success = true });

            // Act
            await _controller.GetById(chainId);

            // Assert
            _mockChainService.Verify(s => s.GetByIdAsync(chainId), Times.Once);
        }

        // Test 8
        [Test]
        public async Task GetById_WithSuccessFalse_DoesNotReturnOk()
        {
            // Arrange
            int chainId = 7;
            var expectedResult = new ApiResponseDto<ApprovalChainResponseDto> { Success = false };
            _mockChainService
                .Setup(s => s.GetByIdAsync(chainId))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.GetById(chainId);

            // Assert
            Assert.That(result, Is.Not.InstanceOf<OkObjectResult>());
        }

        // ──────────────────────────────────────────────
        // Create — returns ApiResponseDto<ApprovalChainResponseDto>
        // ──────────────────────────────────────────────

        // Test 9
        [Test]
        public async Task Create_WithValidRequest_ReturnsOkResult()
        {
            // Arrange
            var dto = new CreateApprovalChainRequestDto();
            var expectedResult = new ApiResponseDto<ApprovalChainResponseDto>
            {
                Success = true,
                Data = new ApprovalChainResponseDto()
            };
            _mockTokenService.Setup(t => t.GetUserIdFromClaims(It.IsAny<ClaimsPrincipal>())).Returns(1);
            _mockChainService
                .Setup(s => s.CreateAsync(It.IsAny<CreateApprovalChainRequestDto>(), It.IsAny<int>()))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.Create(dto);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
        }

        // Test 10
        [Test]
        public async Task Create_WithFailedCreation_ReturnsBadRequest()
        {
            // Arrange
            var dto = new CreateApprovalChainRequestDto();
            var expectedResult = new ApiResponseDto<ApprovalChainResponseDto>
            {
                Success = false,
                Message = "Duplicate chain"
            };
            _mockTokenService.Setup(t => t.GetUserIdFromClaims(It.IsAny<ClaimsPrincipal>())).Returns(1);
            _mockChainService
                .Setup(s => s.CreateAsync(It.IsAny<CreateApprovalChainRequestDto>(), It.IsAny<int>()))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.Create(dto);

            // Assert
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        // Test 11
        [Test]
        public async Task Create_ExtractsUserIdFromTokenService()
        {
            // Arrange
            var dto = new CreateApprovalChainRequestDto();
            _mockTokenService.Setup(t => t.GetUserIdFromClaims(It.IsAny<ClaimsPrincipal>())).Returns(42);
            _mockChainService
                .Setup(s => s.CreateAsync(It.IsAny<CreateApprovalChainRequestDto>(), It.IsAny<int>()))
                .ReturnsAsync(new ApiResponseDto<ApprovalChainResponseDto> { Success = true });

            // Act
            await _controller.Create(dto);

            // Assert
            _mockTokenService.Verify(t => t.GetUserIdFromClaims(It.IsAny<ClaimsPrincipal>()), Times.Once);
        }

        // Test 12
        [Test]
        public async Task Create_PassesCorrectUserIdToService()
        {
            // Arrange
            var dto = new CreateApprovalChainRequestDto();
            int expectedUserId = 7;
            int capturedUserId = 0;
            _mockTokenService.Setup(t => t.GetUserIdFromClaims(It.IsAny<ClaimsPrincipal>())).Returns(expectedUserId);
            _mockChainService
                .Setup(s => s.CreateAsync(It.IsAny<CreateApprovalChainRequestDto>(), It.IsAny<int>()))
                .Callback<CreateApprovalChainRequestDto, int>((d, uid) => capturedUserId = uid)
                .ReturnsAsync(new ApiResponseDto<ApprovalChainResponseDto> { Success = true });

            // Act
            await _controller.Create(dto);

            // Assert
            Assert.That(capturedUserId, Is.EqualTo(expectedUserId));
        }

        // Test 13
        [Test]
        public async Task Create_VerifiesChainServiceCalledOnce()
        {
            // Arrange
            var dto = new CreateApprovalChainRequestDto();
            _mockTokenService.Setup(t => t.GetUserIdFromClaims(It.IsAny<ClaimsPrincipal>())).Returns(1);
            _mockChainService
                .Setup(s => s.CreateAsync(It.IsAny<CreateApprovalChainRequestDto>(), It.IsAny<int>()))
                .ReturnsAsync(new ApiResponseDto<ApprovalChainResponseDto> { Success = true });

            // Act
            await _controller.Create(dto);

            // Assert
            _mockChainService.Verify(
                s => s.CreateAsync(It.IsAny<CreateApprovalChainRequestDto>(), It.IsAny<int>()),
                Times.Once);
        }

        // Test 14
        [Test]
        public async Task Create_PassesDtoToService()
        {
            // Arrange
            var dto = new CreateApprovalChainRequestDto();
            CreateApprovalChainRequestDto? capturedDto = null;
            _mockTokenService.Setup(t => t.GetUserIdFromClaims(It.IsAny<ClaimsPrincipal>())).Returns(1);
            _mockChainService
                .Setup(s => s.CreateAsync(It.IsAny<CreateApprovalChainRequestDto>(), It.IsAny<int>()))
                .Callback<CreateApprovalChainRequestDto, int>((d, _) => capturedDto = d)
                .ReturnsAsync(new ApiResponseDto<ApprovalChainResponseDto> { Success = true });

            // Act
            await _controller.Create(dto);

            // Assert
            Assert.That(capturedDto, Is.SameAs(dto));
        }

        // ──────────────────────────────────────────────
        // Update — returns ApiResponseDto<ApprovalChainResponseDto>
        // ──────────────────────────────────────────────

        // Test 15
        [Test]
        public async Task Update_WithValidRequest_ReturnsOkResult()
        {
            // Arrange
            int chainId = 1;
            var dto = new UpdateApprovalChainRequestDto();
            var expectedResult = new ApiResponseDto<ApprovalChainResponseDto>
            {
                Success = true,
                Data = new ApprovalChainResponseDto()
            };
            _mockChainService
                .Setup(s => s.UpdateAsync(chainId, It.IsAny<UpdateApprovalChainRequestDto>()))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.Update(chainId, dto);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
        }

        // Test 16
        [Test]
        public async Task Update_WithFailedUpdate_ReturnsBadRequest()
        {
            // Arrange
            int chainId = 1;
            var dto = new UpdateApprovalChainRequestDto();
            var expectedResult = new ApiResponseDto<ApprovalChainResponseDto>
            {
                Success = false,
                Message = "Update failed"
            };
            _mockChainService
                .Setup(s => s.UpdateAsync(chainId, It.IsAny<UpdateApprovalChainRequestDto>()))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.Update(chainId, dto);

            // Assert
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        // Test 17
        [Test]
        public async Task Update_PassesCorrectChainIdToService()
        {
            // Arrange
            int expectedChainId = 10;
            int capturedChainId = 0;
            var dto = new UpdateApprovalChainRequestDto();
            _mockChainService
                .Setup(s => s.UpdateAsync(It.IsAny<int>(), It.IsAny<UpdateApprovalChainRequestDto>()))
                .Callback<int, UpdateApprovalChainRequestDto>((id, _) => capturedChainId = id)
                .ReturnsAsync(new ApiResponseDto<ApprovalChainResponseDto> { Success = true });

            // Act
            await _controller.Update(expectedChainId, dto);

            // Assert
            Assert.That(capturedChainId, Is.EqualTo(expectedChainId));
        }

        // Test 18
        [Test]
        public async Task Update_VerifiesServiceCalledOnce()
        {
            // Arrange
            int chainId = 4;
            var dto = new UpdateApprovalChainRequestDto();
            _mockChainService
                .Setup(s => s.UpdateAsync(chainId, It.IsAny<UpdateApprovalChainRequestDto>()))
                .ReturnsAsync(new ApiResponseDto<ApprovalChainResponseDto> { Success = true });

            // Act
            await _controller.Update(chainId, dto);

            // Assert
            _mockChainService.Verify(
                s => s.UpdateAsync(chainId, It.IsAny<UpdateApprovalChainRequestDto>()),
                Times.Once);
        }

        // ──────────────────────────────────────────────
        // Delete — returns ApiResponseDto<bool>
        // ──────────────────────────────────────────────

        // Test 19
        [Test]
        public async Task Delete_WithValidId_ReturnsOkResult()
        {
            // Arrange
            int chainId = 1;
            var expectedResult = new ApiResponseDto<bool> { Success = true, Data = true };
            _mockChainService
                .Setup(s => s.DeleteAsync(chainId))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.Delete(chainId);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
        }

        // Test 20
        [Test]
        public async Task Delete_WithFailedDeletion_ReturnsBadRequest()
        {
            // Arrange
            int chainId = 1;
            var expectedResult = new ApiResponseDto<bool>
            {
                Success = false,
                Message = "Cannot delete active chain"
            };
            _mockChainService
                .Setup(s => s.DeleteAsync(chainId))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.Delete(chainId);

            // Assert
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        // Test 21
        [Test]
        public async Task Delete_VerifiesServiceCalledWithCorrectId()
        {
            // Arrange
            int chainId = 6;
            _mockChainService
                .Setup(s => s.DeleteAsync(chainId))
                .ReturnsAsync(new ApiResponseDto<bool> { Success = true });

            // Act
            await _controller.Delete(chainId);

            // Assert
            _mockChainService.Verify(s => s.DeleteAsync(chainId), Times.Once);
        }

        // Test 22
        [Test]
        public async Task Delete_VerifiesServiceNeverCalledWithWrongId()
        {
            // Arrange
            int chainId = 8;
            _mockChainService
                .Setup(s => s.DeleteAsync(It.IsAny<int>()))
                .ReturnsAsync(new ApiResponseDto<bool> { Success = true });

            // Act
            await _controller.Delete(chainId);

            // Assert
            _mockChainService.Verify(s => s.DeleteAsync(It.Is<int>(id => id != chainId)), Times.Never);
        }

        // ──────────────────────────────────────────────
        // Test endpoint — returns ApiResponseDto<ApprovalChainResponseDto>
        // ──────────────────────────────────────────────

        // ──────────────────────────────────────────────
// Test endpoint — returns ApiResponseDto<bool>
// ──────────────────────────────────────────────

// Test 23
[Test]
public async Task Test_WithValidRequest_ReturnsOkResult()
{
    // Arrange
    var dto = new TestApprovalChainRequestDto();
    var expectedResult = new ApiResponseDto<bool>
    {
        Success = true,
        Data = true
    };
    _mockChainService
        .Setup(s => s.TestAsync(It.IsAny<TestApprovalChainRequestDto>()))
        .ReturnsAsync(expectedResult);

    // Act
    var result = await _controller.Test(dto);

    // Assert
    Assert.That(result, Is.InstanceOf<OkObjectResult>());
}

// Test 24
[Test]
public async Task Test_AlwaysReturnsOkEvenWhenServiceIndicatesFailure()
{
    // Arrange — controller always returns Ok for /test regardless of Success flag
    var dto = new TestApprovalChainRequestDto();
    var expectedResult = new ApiResponseDto<bool>
    {
        Success = false,
        Message = "No approver matched"
    };
    _mockChainService
        .Setup(s => s.TestAsync(It.IsAny<TestApprovalChainRequestDto>()))
        .ReturnsAsync(expectedResult);

    // Act
    var result = await _controller.Test(dto);

    // Assert
    Assert.That(result, Is.InstanceOf<OkObjectResult>());
}

// Test 25
[Test]
public async Task Test_VerifiesServiceCalledOnce()
{
    // Arrange
    var dto = new TestApprovalChainRequestDto();
    _mockChainService
        .Setup(s => s.TestAsync(It.IsAny<TestApprovalChainRequestDto>()))
        .ReturnsAsync(new ApiResponseDto<bool> { Success = true });

    // Act
    await _controller.Test(dto);

    // Assert
    _mockChainService.Verify(
        s => s.TestAsync(It.IsAny<TestApprovalChainRequestDto>()),
        Times.Once);
}

// Test 26
[Test]
public async Task Test_PassesDtoToService()
{
    // Arrange
    var dto = new TestApprovalChainRequestDto();
    TestApprovalChainRequestDto? capturedDto = null;
    _mockChainService
        .Setup(s => s.TestAsync(It.IsAny<TestApprovalChainRequestDto>()))
        .Callback<TestApprovalChainRequestDto>(d => capturedDto = d)
        .ReturnsAsync(new ApiResponseDto<bool> { Success = true });

    // Act
    await _controller.Test(dto);

    // Assert
    Assert.That(capturedDto, Is.SameAs(dto));
}

        // ──────────────────────────────────────────────
        // SetDefault — returns ApiResponseDto<bool>
        // ──────────────────────────────────────────────

        // Test 27
        [Test]
        public async Task SetDefault_WithValidIds_ReturnsOkResult()
        {
            // Arrange
            int chainId = 1;
            int departmentId = 2;
            var expectedResult = new ApiResponseDto<bool> { Success = true, Data = true };
            _mockChainService
                .Setup(s => s.SetDefaultAsync(chainId, departmentId))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.SetDefault(chainId, departmentId);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
        }

        // Test 28
        [Test]
        public async Task SetDefault_WithFailedOperation_ReturnsBadRequest()
        {
            // Arrange
            int chainId = 1;
            int departmentId = 2;
            var expectedResult = new ApiResponseDto<bool>
            {
                Success = false,
                Message = "Chain does not belong to department"
            };
            _mockChainService
                .Setup(s => s.SetDefaultAsync(chainId, departmentId))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.SetDefault(chainId, departmentId);

            // Assert
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        // Test 29
        [Test]
        public async Task SetDefault_PassesCorrectBothIdsToService()
        {
            // Arrange
            int expectedChainId = 3;
            int expectedDepartmentId = 7;
            int capturedChainId = 0;
            int capturedDeptId = 0;
            _mockChainService
                .Setup(s => s.SetDefaultAsync(It.IsAny<int>(), It.IsAny<int>()))
                .Callback<int, int>((cid, did) => { capturedChainId = cid; capturedDeptId = did; })
                .ReturnsAsync(new ApiResponseDto<bool> { Success = true });

            // Act
            await _controller.SetDefault(expectedChainId, expectedDepartmentId);

            // Assert
            Assert.That(capturedChainId, Is.EqualTo(expectedChainId));
            Assert.That(capturedDeptId, Is.EqualTo(expectedDepartmentId));
        }

        // Test 30
        [Test]
        public async Task SetDefault_VerifiesServiceCalledOnce()
        {
            // Arrange
            int chainId = 2;
            int departmentId = 4;
            _mockChainService
                .Setup(s => s.SetDefaultAsync(chainId, departmentId))
                .ReturnsAsync(new ApiResponseDto<bool> { Success = true });

            // Act
            await _controller.SetDefault(chainId, departmentId);

            // Assert
            _mockChainService.Verify(s => s.SetDefaultAsync(chainId, departmentId), Times.Once);
        }
    }
}
